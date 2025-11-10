package com.hirepicker.service;

import java.sql.Date;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.AcademicAbilityDto;
import com.hirepicker.dto.CertificationUpdateRequestDto;
import com.hirepicker.dto.MilitaryServiceDto;
import com.hirepicker.dto.WorkExperienceDto;
import com.hirepicker.entity.Certification;
import com.hirepicker.entity.Resume;
import com.hirepicker.repository.CertificationRepository;
import com.hirepicker.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final JdbcTemplate jdbcTemplate;
    private final CertificationRepository certificationRepository; // 자격증 마스터 조회/생성용
    private final ResumeRepository resumeRepository; // 이력서 조회용

    // 개인회원 기본정보 업데이트 (비밀번호 제외)
    @Transactional
    // 생년월일(birth_date)까지 반영하도록 확장
    public void updatePersonalUser(Long userId, String name, String gender, String phoneNumber, String address, String birthDate, String encodedPassword, String nickname) {
        // 닉네임은 별도 컨트롤러에서 중복 체크 이미 수행, 여기서는 전달된 값만 반영
        // 선택적 필드 업데이트를 위해 각각 개별 쿼리 수행 (간단 구현)
        if (encodedPassword != null && !encodedPassword.isBlank()) {
            jdbcTemplate.update("UPDATE personal_user SET password=? WHERE p_user_idx=?", encodedPassword, userId);
        }
        if (nickname != null && !nickname.isBlank()) {
            jdbcTemplate.update("UPDATE personal_user SET nickname=? WHERE p_user_idx=?", nickname.trim(), userId);
        }
        if (name != null && !name.isBlank()) {
            jdbcTemplate.update("UPDATE personal_user SET name=? WHERE p_user_idx=?", name.trim(), userId);
        }
        if (gender != null && !gender.isBlank()) {
            jdbcTemplate.update("UPDATE personal_user SET gender=? WHERE p_user_idx=?", gender.trim(), userId);
        }
        if (phoneNumber != null) {
            jdbcTemplate.update("UPDATE personal_user SET phone_number=? WHERE p_user_idx=?", phoneNumber.trim(), userId);
        }
        if (address != null) {
            jdbcTemplate.update("UPDATE personal_user SET address=? WHERE p_user_idx=?", address.trim(), userId);
        }
        if (birthDate != null && !birthDate.isBlank()) {
            // 'YYYY-MM-DD' 형식을 LocalDate로 변환해 저장
            jdbcTemplate.update("UPDATE personal_user SET birth_date=? WHERE p_user_idx=?", java.sql.Date.valueOf(birthDate.trim()), userId);
        }
    }

    // 학력 전체 교체 로직
    @Transactional
    public void replaceAcademics(Long userId, List<AcademicAbilityDto> list) {
        // 모두 삭제 후 재삽입(간단 교체 정책) - 학력 저장 로직 보강
        jdbcTemplate.update("DELETE FROM academic_ability WHERE p_user_idx=?", userId);
        if (list == null || list.isEmpty()) return;
        java.util.Set<Long> seenSchoolCodes = new java.util.LinkedHashSet<>(); // 동일 학교 중복 방지
        String sql = "INSERT INTO academic_ability (p_user_idx, school_code, degree, major, major_score, admission_date, graduation_date) VALUES (?,?,?,?,?,?,?)";
        for (AcademicAbilityDto d : list) {
            if (d == null) continue;
            Long schoolCode = d.getSchoolCode();
            String degree = d.getDegree();
            // degree ENUM 간단 검증(고졸/학사/석사/박사)
            if (degree == null || degree.isBlank() || !("고졸".equals(degree) || "학사".equals(degree) || "석사".equals(degree) || "박사".equals(degree))) {
                throw new IllegalArgumentException("degree 값이 유효하지 않습니다.");
            }
            if (schoolCode == null) throw new IllegalArgumentException("school_code는 필수입니다.");
            if (d.getMajor() == null || d.getMajor().isBlank()) throw new IllegalArgumentException("major는 필수입니다.");
            if (d.getMajorScore() == null) throw new IllegalArgumentException("major_score는 필수입니다.");
            // 동일 school_code 중복 삽입 방지(PK 충돌 사전 차단)
            if (!seenSchoolCodes.add(schoolCode)) continue;

            jdbcTemplate.update(sql,
                userId,
                schoolCode,
                degree,
                d.getMajor(),
                d.getMajorScore(),
                d.getAdmissionDate() != null ? Date.valueOf(d.getAdmissionDate()) : null,
                d.getGraduationDate() != null ? Date.valueOf(d.getGraduationDate()) : null
            );
        }
    }

    // 경력 전체 교체 로직
    @Transactional
    public void replaceExperiences(Long userId, List<WorkExperienceDto> list) {
        jdbcTemplate.update("DELETE FROM work_experience WHERE p_user_idx=?", userId);
        if (list == null || list.isEmpty()) return;
        String sql = "INSERT INTO work_experience (p_user_idx, company_name, department, position, hire_date, resign_date, job_description, main_duties) VALUES (?,?,?,?,?,?,?,?)";
        for (WorkExperienceDto d : list) {
            jdbcTemplate.update(sql,
                userId,
                d.getCompanyName(),
                d.getDepartment(),
                d.getPosition(),
                d.getHireDate() != null ? Date.valueOf(d.getHireDate()) : null,
                d.getResignDate() != null ? Date.valueOf(d.getResignDate()) : null,
                d.getJobDescription(),
                d.getMainDuties()
            );
        }
    }

    // 병역 조건 upsert(기존 데이터는 1건만 유지)
    @Transactional
    public void upsertMilitary(Long userId, MilitaryServiceDto d) {
        jdbcTemplate.update("DELETE FROM military_service WHERE p_user_idx=?", userId);
        if (d == null) return;
        boolean hasAny = !isBlank(d.getServiceType()) || !isBlank(d.getMilitaryBranch()) || !isBlank(d.getMilitaryRank())
                || d.getEnlistmentDate() != null || d.getDischargeDate() != null || !isBlank(d.getReasonForExemption());
        if (!hasAny) return;
        jdbcTemplate.update(
            "INSERT INTO military_service (p_user_idx, service_type, military_branch, military_rank, enlistment_date, discharge_date, reason_for_exemption) VALUES (?,?,?,?,?,?,?)",
            userId,
            d.getServiceType(),
            d.getMilitaryBranch(),
            d.getMilitaryRank(),
            d.getEnlistmentDate() != null ? Date.valueOf(d.getEnlistmentDate()) : null,
            d.getDischargeDate() != null ? Date.valueOf(d.getDischargeDate()) : null,
            d.getReasonForExemption()
        );
    }

    // 자격증 매핑 전체 교체: have_certification (resume_idx, cert_idx)
    @Transactional
    public void replaceResumeCertifications(Long userId, Long resumeId,
                                            List<CertificationUpdateRequestDto.Item> items) {
        // resumeId가 null이면 기본 이력서 자동 조회
        Long targetResumeId = resumeId;
        if (targetResumeId == null) {
            java.util.Optional<Resume> latestResume = resumeRepository.findTopByPersonalUserIdOrderByIdDesc(userId);
            if (latestResume.isEmpty()) {
                return; // 등록된 이력서가 없으면 아무 작업도 수행하지 않는다.
            }
            targetResumeId = latestResume.get().getId();
        }
        
        // 이력서 소유자 검증
        Integer owns = jdbcTemplate.queryForObject(
                "SELECT COUNT(1) FROM resumes WHERE resume_idx=? AND p_user_idx=?",
                Integer.class, targetResumeId, userId);
        if (owns == null || owns == 0) throw new IllegalArgumentException("본인 이력서가 아닙니다.");

        // 최종 certIdx 목록 구성
        java.util.LinkedHashMap<Long, String> finalEntries = new java.util.LinkedHashMap<>();
        if (items != null) {
            for (CertificationUpdateRequestDto.Item item : items) {
                if (item == null) continue;
                Long certIdx = item.getCertIdx();
                String certName = item.getCertName();
                if (certIdx == null) {
                    if (certName == null || certName.isBlank()) continue;
                    certIdx = certificationRepository
                            .findByCertName(certName.trim())
                            .map(Certification::getCertIdx)
                            .orElseGet(() -> certificationRepository.save(
                                    Certification.builder().certName(certName.trim()).build()
                            ).getCertIdx());
                }
                if (certIdx == null) continue;
                String score = item.getScore();
                String sanitizedScore = (score != null && !score.isBlank()) ? score.trim() : null;
                if (sanitizedScore != null && sanitizedScore.length() > 20) {
                    sanitizedScore = sanitizedScore.substring(0, 20);
                }
                finalEntries.put(certIdx, sanitizedScore);
            }
        }

        // 매핑 전체 삭제 후 삽입
        jdbcTemplate.update("DELETE FROM have_certification WHERE resume_idx=?", targetResumeId);
        if (finalEntries.isEmpty()) return; // 입력 없으면 비움
        String insertSql = "INSERT INTO have_certification (resume_idx, cert_idx, score) VALUES (?,?,?)";
        for (java.util.Map.Entry<Long, String> entry : finalEntries.entrySet()) {
            jdbcTemplate.update(insertSql, targetResumeId, entry.getKey(), entry.getValue());
        }
    }

    // 자격증 조회 (기본 이력서 기준)
    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> listCertifications(Long userId) {
        // 기본 이력서 조회
        java.util.Optional<Resume> resumeOpt = resumeRepository.findTopByPersonalUserIdOrderByIdDesc(userId);
        if (resumeOpt.isEmpty()) {
            return java.util.List.of(); // 등록된 이력서가 없으면 빈 목록 반환
        }
        Long resumeId = resumeOpt.get().getId();
        
        // 자격증 조회 (have_certification + certification 조인)
        String sql = "SELECT c.cert_idx, c.cert_name, hc.score " +
                     "FROM have_certification hc " +
                     "INNER JOIN certification c ON c.cert_idx = hc.cert_idx " +
                     "WHERE hc.resume_idx = ? " +
                     "ORDER BY c.cert_name ASC";
        return jdbcTemplate.query(sql, (rs, i) -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("certIdx", rs.getLong("cert_idx"));
            map.put("certName", rs.getString("cert_name"));
            map.put("score", rs.getString("score"));
            return map;
        }, resumeId);
    }

    // 학력 조회(JDBC 사용, 엔티티 PK 불일치 영향 회피)
    @Transactional(readOnly = true)
    public java.util.List<com.hirepicker.dto.AcademicAbilityViewDto> listAcademics(Long userId) {
        // 학력 + 학교 테이블을 조인하여 캠퍼스 정보까지 함께 가져온다
        String sql = "SELECT a.school_code, s.school_name, s.campus, a.degree, a.major, a.major_score, a.admission_date, a.graduation_date " +
                     "FROM academic_ability a LEFT JOIN school s ON s.school_code = a.school_code " +
                     "WHERE a.p_user_idx = ? ORDER BY a.graduation_date DESC";
        // JDBC 템플릿으로 DTO 매핑, graduation_date는 null 안전 처리
        return jdbcTemplate.query(sql, (rs, i) -> new com.hirepicker.dto.AcademicAbilityViewDto(
                rs.getObject("school_code") != null ? rs.getLong("school_code") : null,
                rs.getString("school_name"),
                rs.getString("campus"),
                rs.getString("degree"),
                rs.getString("major"),
                rs.getBigDecimal("major_score"),
                rs.getDate("admission_date") != null ? rs.getDate("admission_date").toLocalDate() : null,
                rs.getDate("graduation_date") != null ? rs.getDate("graduation_date").toLocalDate() : null
        ), userId);
    }

    // 이력서 레코드 선택적 업데이트 (필드 단위)
    @Transactional
    public int updateResume(Long userId, Long resumeId,
                            String title, String selfGrowth, String selfStrengths,
                            String selfMotivation, String selfAspirations,
                            String imageUrl, Integer creditCost, String status,
                            String cert, Long expIdx) {
        StringBuilder sql = new StringBuilder("UPDATE resumes SET ");
        java.util.List<Object> params = new java.util.ArrayList<>();

        // 전달 필드만 업데이트
        if (title != null) { sql.append("title=?,"); params.add(title); }
        if (selfGrowth != null) { sql.append("background_and_growth=?,"); params.add(selfGrowth); }
        if (selfStrengths != null) { sql.append("personality=?,"); params.add(selfStrengths); }
        if (selfMotivation != null) { sql.append("motivation_for_application=?,"); params.add(selfMotivation); }
        if (selfAspirations != null) { sql.append("future_aspirations=?,"); params.add(selfAspirations); }
        if (imageUrl != null) { sql.append("img=?,"); params.add(imageUrl); }
        if (creditCost != null) {
            int sanitizedCost = Math.max(0, creditCost);
            sql.append("credit_cost=?,");
            params.add(sanitizedCost);
        }
        if (status != null) { sql.append("status=?,"); params.add(status); }
        if (cert != null) { sql.append("cert=?,"); params.add(cert); }
        // DB 스키마에는 resumes.exp_idx 컬럼이 없으므로 조인 테이블(chosen_exp)로 별도 처리

        // 수정할 값이 없으면 0 반환
        if (params.isEmpty()) return 0;

        // 끝 콤마 제거 후 WHERE 절 추가
        sql.setLength(sql.length() - 1);
        sql.append(" WHERE resume_idx=? AND p_user_idx=?");
        params.add(resumeId);
        params.add(userId);

        int rows = jdbcTemplate.update(sql.toString(), params.toArray());

        // 선택 경력 매핑(chosen_exp) 갱신: 기존 매핑 제거 후 새 expIdx가 있으면 삽입
        if (expIdx != null) {
            jdbcTemplate.update("DELETE FROM chosen_exp WHERE resume_idx=?", resumeId);
            jdbcTemplate.update("INSERT INTO chosen_exp (exp_idx, resume_idx) VALUES (?,?)", expIdx, resumeId);
        }

        return rows;
    }

    @Transactional
    public boolean deleteResume(Long userId, Long resumeId) {
        // 본인 이력서인지 검증한다.
        Resume resume = resumeRepository.findById(resumeId).orElse(null);
        if (resume == null) return false;
        if (!resume.getPersonalUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 이력서만 삭제할 수 있습니다.");
        }
        // FK 정리를 위해 관련 매핑을 먼저 삭제한다.
        jdbcTemplate.update("DELETE FROM have_certification WHERE resume_idx=?", resumeId);
        jdbcTemplate.update("DELETE FROM chosen_exp WHERE resume_idx=?", resumeId);
        jdbcTemplate.update("DELETE FROM applications WHERE resume_idx=?", resumeId);
        resumeRepository.delete(resume);
        return true;
    }

    private static boolean isBlank(String s) { return s == null || s.isBlank(); }
}

