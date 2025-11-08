package com.hirepicker.service;

import com.hirepicker.dto.ResumeDto;
import com.hirepicker.dto.ResumeResponseDto;
import com.hirepicker.dto.ResumeDetailDto;
import com.hirepicker.dto.AcademicAbilityDto;
import com.hirepicker.dto.MilitaryServiceDto;
import com.hirepicker.dto.WorkExperienceDto;
import com.hirepicker.dto.AcademicAbilityViewDto; // 자동채움 학력 요약 DTO
import com.hirepicker.dto.ResumeTemplateDto; // 자동채움 응답 DTO
import com.hirepicker.entity.*;
import com.hirepicker.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.hirepicker.config.security.CustomUserDetails;

// 이력서 관련 비즈니스 로직을 처리하는 서비스
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final PersonalUserRepository personalUserRepository;
    private final WorkExperienceRepository workExperienceRepository; // 경력 리포지토리
    private final AcademicAbilityRepository academicAbilityRepository; // 학력 리포지토리
    private final MilitaryServiceRepository militaryServiceRepository; // 병역 리포지토리
    private final SchoolRepository schoolRepository; // 학교 리포지토리
    private final S3UploadService s3UploadService; // S3 업로드 서비스

    // 이력서를 생성/저장
    @Transactional
    public ResumeResponseDto saveResume(ResumeDto resumeDto, MultipartFile imageFile) throws IOException {
        // 1) 사용자 존재 확인
        PersonalUser personalUser = personalUserRepository.findById(resumeDto.getPUserIdx())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자를 찾을 수 없습니다. id=" + resumeDto.getPUserIdx()));

        // 2) 이미지 업로드 처리(S3)
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = s3UploadService.uploadFile(imageFile, "resume-images");
        }

        // 3) 기본 이력서 엔티티 변환 및 선택 경력 연결
        Resume resume = resumeDto.toEntity(personalUser, imageUrl);
        if (resumeDto.getExpIdx() != null) {
            workExperienceRepository.findById(resumeDto.getExpIdx())
                    .ifPresent(resume::attachWorkExperience);
        }

        // 3-2) 성별이 전달되면 PersonalUser에 반영(유효 값만 적용)
        if (resumeDto.getGender() != null) {
            try {
                personalUser.setGender(Gender.valueOf(resumeDto.getGender())); // 성별 업데이트
            } catch (IllegalArgumentException ignored) { /* 잘못된 값이면 무시 */ }
        }

        // 3-3) 학력/경력/병역 저장 (선택)
        saveAcademicAbilities(resumeDto.getAcademicAbilities(), personalUser); // 학력 저장
        saveWorkExperiences(resumeDto.getWorkExperiences(), personalUser);    // 경력 저장
        saveMilitaryService(resumeDto.getMilitaryService(), personalUser);     // 병역 저장

        // 4) 이력서 저장
        Resume savedResume = resumeRepository.save(resume);

        // 5) 응답 반환
        return new ResumeResponseDto(savedResume);
    }

    // 자동채움 데이터 조회(학력/경력/병역을 한 번에 반환)
    @Transactional
    public ResumeTemplateDto getResumeTemplate(Long userId) {
        // 학력 요약: 최근 졸업일 순으로 학교명 포함
        var academicList = academicAbilityRepository
                .findByPersonalUserOrderByGraduationDateDesc(userId)
                .stream()
                .map(a -> {
                    // 학교 엔티티를 조회해 학교명/캠퍼스 정보를 조합
                    School school = schoolRepository.findById(a.getSchool()).orElse(null);
                    String schoolName = school != null ? school.getSchoolName() : null;
                    String campus = school != null ? school.getCampus() : null;
                    return new AcademicAbilityViewDto(
                            a.getSchool(),
                            schoolName,
                            campus,
                            a.getDegree(),
                            a.getMajor(),
                            a.getMajorScore(),
                            a.getGraduationDate()
                    );
                }).toList();

        // 경력 목록: 최신 입사일 순으로 변환
        var expList = workExperienceRepository.findByPersonalUserIdOrderByHireDateDesc(userId)
                .stream()
                .map(w -> new WorkExperienceDto(
                        null,
                        w.getCompanyName(),
                        w.getDepartment(),
                        w.getPosition(),
                        w.getHireDate(),
                        w.getResignDate(),
                        w.getJobDescription(),
                        w.getMainDuties()
                ))
                .toList();

        // 병역: 최신 1건만 제공(없으면 null)
        MilitaryServiceDto military = militaryServiceRepository.findTopByPersonalUserIdOrderByIdDesc(userId)
                .map(m -> new MilitaryServiceDto(
                        null,
                        m.getServiceType(),
                        m.getMilitaryBranch(),
                        m.getMilitaryRank(),
                        m.getPeriodOfService(),
                        m.getReasonForExemption()
                ))
                .orElse(null);

        return new ResumeTemplateDto(academicList, expList, military);
    }

    // 상세 조회(소유자 검증 포함)
    @Transactional
    public ResumeDetailDto getResumeDetail(Long resumeId) {
        // 현재 사용자
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        com.hirepicker.config.security.CustomUserDetails principal = (com.hirepicker.config.security.CustomUserDetails) auth.getPrincipal();

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이력서입니다."));
        // 소유자 검증(개인회원만)
        if (!resume.getPersonalUser().getId().equals(principal.getId())) {
            throw new IllegalArgumentException("조회 권한이 없습니다.");
        }
        // 개인 정보 구성
        var user = resume.getPersonalUser();
        var personal = new ResumeDetailDto.Personal(
                user.getName(), user.getEmail(), user.getPhoneNumber(), user.getAddress(),
                user.getGender() != null ? user.getGender().name() : null);

        // 학력 목록 구성
        var academicList = academicAbilityRepository
                .findByPersonalUserOrderByGraduationDateDesc(user.getId())
                .stream()
                .map(a -> {
                    String schoolName = schoolRepository.findById(a.getSchool())
                            .map(School::getSchoolName)
                            .orElse(null);
                    return new ResumeDetailDto.Academic(
                            schoolName,
                            a.getDegree(), a.getMajor(), a.getMajorScore(), a.getGraduationDate()
                    );
                }).toList();

        // 경력 목록 구성
        var experienceList = workExperienceRepository
                .findByPersonalUserIdOrderByHireDateDesc(user.getId())
                .stream()
                .map(w -> new ResumeDetailDto.Experience(
                        w.getCompanyName(), w.getDepartment(), w.getPosition(),
                        w.getHireDate(), w.getResignDate(), w.getJobDescription(), w.getMainDuties()
                )).toList();

        // 병역 정보 구성(옵션)
        var militaryOpt = militaryServiceRepository.findTopByPersonalUserIdOrderByIdDesc(user.getId());
        ResumeDetailDto.Military military = militaryOpt.map(m -> new ResumeDetailDto.Military(
                m.getServiceType(), m.getMilitaryBranch(), m.getMilitaryRank(),
                m.getPeriodOfService(), m.getReasonForExemption()
        )).orElse(null);

        return ResumeDetailDto.builder()
                .r(resume)
                .expIdx(resume.getWorkExperience() != null ? resume.getWorkExperience().getId() : null)
                .personal(personal)
                .academics(academicList)
                .experiences(experienceList)
                .military(military)
                .build();
    }

    // 내 이력서 목록 조회(로그인 사용자 기준)
    @Transactional
    public java.util.List<com.hirepicker.dto.ResumeListItemDto> getMyResumes() {
        // 보안 컨텍스트에서 사용자 식별자 획득
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        if (principal.getUserType() != UserType.PERSONAL) {
            // 기업 계정은 개인 이력서 목록이 없으므로 빈 목록 반환
            return java.util.List.of();
        }
        java.util.List<Resume> resumes = resumeRepository.findByPersonalUserIdOrderByIdDesc(principal.getId()); // 사용자별 조회
        return resumes.stream()
                .map(resume -> com.hirepicker.dto.ResumeListItemDto.from(
                        resume,
                        resume.getWorkExperience() != null ? resume.getWorkExperience().getId() : null))
                .collect(java.util.stream.Collectors.toList());
    }

    // 학력 저장 로직(리스트가 null/빈 경우 무시)
    private void saveAcademicAbilities(java.util.List<AcademicAbilityDto> list, PersonalUser user) {
        if (list == null || list.isEmpty()) return; // 입력 없으면 패스
        for (AcademicAbilityDto dto : list) {
            School school = schoolRepository.findById(dto.getSchoolCode()).orElse(null);
            if (school == null) continue; // 유효하지 않으면 스킵
            AcademicAbility ability = newAcademicAbility(user, school, dto); // 엔티티 변환
            academicAbilityRepository.save(ability); // 저장
        }
    }

    // 경력 저장 로직
    private void saveWorkExperiences(java.util.List<WorkExperienceDto> list, PersonalUser user) {
        if (list == null || list.isEmpty()) return; // 입력 없으면 패스
        for (WorkExperienceDto dto : list) {
            WorkExperience we = newWorkExperience(user, dto); // 엔티티 변환
            workExperienceRepository.save(we); // 저장
        }
    }

    // 병역 저장 로직
    private void saveMilitaryService(MilitaryServiceDto dto, PersonalUser user) {
        if (dto == null) return; // 입력 없으면 패스
        MilitaryService ms = newMilitaryService(user, dto); // 엔티티 변환
        militaryServiceRepository.save(ms); // 저장
    }

    // 학력 엔티티 생성 (빌더 패턴 사용)
    private AcademicAbility newAcademicAbility(PersonalUser user, School school, AcademicAbilityDto dto) {
        return AcademicAbility.builder()
                .personalUser(user.getId())
                .school(school.getSchoolCode())
                .degree(dto.getDegree())
                .major(dto.getMajor())
                .majorScore(dto.getMajorScore())
                .graduationDate(dto.getGraduationDate())
                .build();
    }

    // 경력 엔티티 생성 (빌더 패턴 사용)
    private WorkExperience newWorkExperience(PersonalUser user, WorkExperienceDto dto) {
        return WorkExperience.builder()
                .personalUser(user)
                .companyName(dto.getCompanyName())
                .department(dto.getDepartment())
                .position(dto.getPosition())
                .hireDate(dto.getHireDate())
                .resignDate(dto.getResignDate())
                .jobDescription(dto.getJobDescription())
                .mainDuties(dto.getMainDuties())
                .build();
    }

    // 병역 엔티티 생성 (빌더 패턴 사용)
    private MilitaryService newMilitaryService(PersonalUser user, MilitaryServiceDto dto) {
        return MilitaryService.builder()
                .personalUser(user)
                .serviceType(dto.getServiceType())
                .militaryBranch(dto.getMilitaryBranch())
                .militaryRank(dto.getMilitaryRank())
                .periodOfService(dto.getPeriodOfService())
                .reasonForExemption(dto.getReasonForExemption())
                .build();
    }

    // 리플렉션 안전 헬퍼 (더 이상 사용되지 않음)
    @SuppressWarnings("unused") // 과거 호환성 유지용 메서드
    private static void setField(Object target, String fieldName, Object value) throws Exception {
        // 이 메서드는 더 이상 사용되지 않으므로 비워둡니다.
    }
}
