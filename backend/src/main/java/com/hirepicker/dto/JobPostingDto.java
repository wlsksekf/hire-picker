package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.JobPostingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 채용공고 DTO
 *
 * 기업회원이 자신의 채용공고 목록을 조회할 때 사용
 */
@Data
@Builder
public class JobPostingDto {
    private Long postingIdx;              // 공고 ID (PK)
    private String postingId;             // 공고 ID (유니크)
    
    @JsonProperty("cUserIdx")
    private Long cUserIdx;                // 회사회원 ID (null이면 외부 공고)
    
    private String companyName;           // 회사명
    private String title;                 // 공고 제목
    private String employmentType;        // 고용 형태 (정규직, 계약직 등)
    private String experienceLevel;       // 경력 수준
    private String salaryInfo;            // 급여 정보
    private String location;              // 근무 지역
    private String jobType;               // 직무 유형
    private JobPostingStatus status;      // 공고 상태 (OPEN, CLOSED 등)
    private LocalDateTime regDate;        // 등록일
    private LocalDateTime modDate;        // 수정일
    private Integer hireCount;            // 채용 인원
    private LocalDate startDate;          // 모집 시작일
    private LocalDate endDate;            // 모집 마감일

    // 상세 정보 (수정 폼에서 필요)
    private String description;           // 공고 설명
    private String requiredQualifications; // 필수 자격요건
    private String preferredQualifications; // 우대 자격요건
    private String welfare;               // 복리후생

    // 추가 정보 (나중에 지원자 수 등 추가 가능)
    private Integer applicantCount;       // 지원자 수 (TODO: 구현 필요)

    /**
     * Entity → DTO 변환 (정적 팩토리 메서드)
     *
     * @param jobPosting JobPosting 엔티티
     * @return JobPostingDto
     */
    public static JobPostingDto fromEntity(JobPosting jobPosting) {
        return JobPostingDto.builder()
                .postingIdx(jobPosting.getPostingIdx())
                .postingId(jobPosting.getPostingId())
                .cUserIdx(jobPosting.getCUserIdx()) // 회사회원 ID (null이면 외부 공고)
                .companyName(jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyName() : null)
                .title(jobPosting.getTitle())
                .employmentType(jobPosting.getEmploymentType())
                .experienceLevel(jobPosting.getExperienceLevel())
                .salaryInfo(jobPosting.getSalaryInfo())
                .location(jobPosting.getLocation())
                .jobType(jobPosting.getJobType())
                .status(jobPosting.getStatus())
                .regDate(jobPosting.getRegDate())
                .modDate(jobPosting.getModDate())
                .hireCount(jobPosting.getHireCount())
                .startDate(jobPosting.getStartDate())
                .endDate(jobPosting.getEndDate())
                .description(jobPosting.getDescription())
                .requiredQualifications(jobPosting.getRequiredQualifications())
                .preferredQualifications(jobPosting.getPreferredQualifications())
                .welfare(jobPosting.getWelfare())
                .applicantCount(0) // TODO: 실제 지원자 수 조회 로직 추가
                .build();
    }
}

