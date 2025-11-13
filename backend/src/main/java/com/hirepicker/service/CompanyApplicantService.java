package com.hirepicker.service;

import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.CompanyApplicantResumeDto;
import com.hirepicker.dto.CompanyApplicantSummaryDto;
import com.hirepicker.entity.Applications;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Resume;
import com.hirepicker.entity.WorkExperience;
import com.hirepicker.repository.ApplicationsRepository;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;

/**
 * 기업회원이 지원자를 관리할 때 사용하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class CompanyApplicantService {

    private static final Map<String, String> STATUS_LABEL_MAP = Map.of(
            "0", "지원중",
            "1", "서류합격",
            "2", "면접합격",
            "3", "최종합격",
            "4", "서류탈락"
    );

    private static final Set<String> ALLOWED_STATUS_CODES = STATUS_LABEL_MAP.keySet();

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.KOREA);

    private final CompanyUserRepository companyUserRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ApplicationsRepository applicationsRepository;
    private final ResumeRepository resumeRepository;

    /**
     * 기업회원이 소유한 공고에 지원한 지원자 목록을 조회한다.
     */
    @Transactional(readOnly = true)
    public List<CompanyApplicantSummaryDto> getApplicantsForPosting(Long companyUserId, Long postingIdx) {
        JobPosting jobPosting = validatePostingOwnership(companyUserId, postingIdx);

        List<Applications> applications = applicationsRepository.findByPostingIdxOrderByResumeDateDesc(postingIdx);
        if (applications.isEmpty()) {
            return Collections.emptyList(); // 지원자가 없으면 빈 목록 반환
        }

        List<Long> resumeIds = applications.stream()
                .map(Applications::getResumeIdx)
                .toList();

        Map<Long, Resume> resumeMap = resumeRepository.findAllById(resumeIds).stream()
                .collect(Collectors.toMap(Resume::getId, resume -> resume));

        return applications.stream()
                .map(application -> toSummaryDto(jobPosting, application, resumeMap.get(application.getResumeIdx())))
                .collect(Collectors.toList());
    }

    /**
     * 기업회원이 지원자의 상세 이력서를 조회한다.
     */
    @Transactional(readOnly = true)
    public CompanyApplicantResumeDto getResumeForApplication(Long companyUserId, Long postingIdx, Long resumeIdx) {
        JobPosting jobPosting = validatePostingOwnership(companyUserId, postingIdx);

        Applications application = applicationsRepository.findByResumeIdxAndPostingIdx(resumeIdx, postingIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 지원 이력이 존재하지 않습니다."));

        Resume resume = resumeRepository.findById(resumeIdx)
                .orElseThrow(() -> new IllegalArgumentException("이력서를 찾을 수 없습니다."));

        return toResumeDto(jobPosting, application, resume);
    }

    /**
     * 기업회원이 지원 상태를 갱신한다.
     */
    @Transactional
    public void updateApplicationStatus(Long companyUserId, Long postingIdx, Long resumeIdx, String statusCode) {
        if (statusCode == null || !ALLOWED_STATUS_CODES.contains(statusCode)) {
            throw new IllegalArgumentException("지원 상태 코드가 올바르지 않습니다.");
        }

        validatePostingOwnership(companyUserId, postingIdx);

        Applications application = applicationsRepository.findByResumeIdxAndPostingIdx(resumeIdx, postingIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 지원 이력이 존재하지 않습니다."));

        application.setStatus(statusCode); // 상태 코드 갱신
        applicationsRepository.save(application); // 변경사항 반영
    }

    /**
     * 공고 소유권을 검증한다.
     */
    private JobPosting validatePostingOwnership(Long companyUserId, Long postingIdx) {
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> new IllegalArgumentException("기업회원 정보를 찾을 수 없습니다."));

        JobPosting jobPosting = jobPostingRepository.findByPostingIdx(postingIdx)
                .orElseThrow(() -> new IllegalArgumentException("채용공고를 찾을 수 없습니다."));

        if (!jobPosting.getCompany().getCompanyIdx().equals(companyUser.getCompany().getCompanyIdx())) {
            throw new IllegalArgumentException("다른 회사의 채용공고에는 접근할 수 없습니다.");
        }

        return jobPosting;
    }

    /**
     * 지원 목록에서 사용하는 요약 DTO로 변환한다.
     */
    private CompanyApplicantSummaryDto toSummaryDto(JobPosting jobPosting, Applications application, Resume resume) {
        PersonalUser personalUser = Optional.ofNullable(resume)
                .map(Resume::getPersonalUser)
                .orElse(null);

        return CompanyApplicantSummaryDto.builder()
                .postingIdx(jobPosting.getPostingIdx())
                .resumeIdx(application.getResumeIdx())
                .applicantName(personalUser != null ? personalUser.getName() : null)
                .applicantEmail(personalUser != null ? personalUser.getEmail() : null)
                .applicantPhone(personalUser != null ? personalUser.getPhoneNumber() : null)
                .resumeTitle(resume != null ? resume.getTitle() : null)
                .appliedAt(application.getResumeDate())
                .statusCode(application.getStatus())
                .statusLabel(application.getStatus() != null
                        ? STATUS_LABEL_MAP.getOrDefault(application.getStatus(), application.getStatus())
                        : "지원중")
                .build();
    }

    /**
     * 상세 이력서 DTO로 변환한다.
     */
    private CompanyApplicantResumeDto toResumeDto(JobPosting jobPosting, Applications application, Resume resume) {
        PersonalUser personalUser = resume.getPersonalUser();
        WorkExperience workExperience = resume.getWorkExperience();

        CompanyApplicantResumeDto.WorkHistorySnippet workHistorySnippet = null;
        if (workExperience != null) {
            workHistorySnippet = CompanyApplicantResumeDto.WorkHistorySnippet.builder()
                    .companyName(workExperience.getCompanyName())
                    .position(workExperience.getPosition())
                    .department(workExperience.getDepartment())
                    .mainDuties(workExperience.getMainDuties())
                    .jobDescription(workExperience.getJobDescription())
                    .hireDate(workExperience.getHireDate() != null ? workExperience.getHireDate().format(DATE_FORMATTER) : null)
                    .resignDate(workExperience.getResignDate() != null ? workExperience.getResignDate().format(DATE_FORMATTER) : null)
                    .build();
        }

        return CompanyApplicantResumeDto.builder()
                .postingIdx(jobPosting.getPostingIdx())
                .resumeIdx(application.getResumeIdx())
                .applicantName(personalUser != null ? personalUser.getName() : null)
                .applicantEmail(personalUser != null ? personalUser.getEmail() : null)
                .applicantPhone(personalUser != null ? personalUser.getPhoneNumber() : null)
                .resumeTitle(resume.getTitle())
                .imageUrl(resume.getImageUrl())
                .selfGrowth(resume.getSelfGrowth())
                .selfStrengths(resume.getSelfStrengths())
                .selfMotivation(resume.getSelfMotivation())
                .selfAspirations(resume.getSelfAspirations())
                .cert(resume.getCert())
                .workHistory(workHistorySnippet)
                .build();
    }
}

