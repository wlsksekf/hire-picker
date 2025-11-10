package com.hirepicker.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 채용공고 생성 DTO
 *
 * 기업회원이 새 채용공고를 등록할 때 사용
 */
@Data
public class JobPostingCreateDto {
    private String title;                      // 공고 제목
    private String employmentType;             // 고용 형태
    private String experienceLevel;            // 경력 수준
    private String salaryInfo;                 // 급여 정보
    private String location;                   // 근무 지역
    private String jobType;                    // 직무 유형
    private Integer hireCount;                 // 채용 인원
    private LocalDate startDate;               // 모집 시작일
    private LocalDate endDate;                 // 모집 마감일
    private String description;                // 공고 설명
    private String requiredQualifications;     // 필수 자격요건
    private String preferredQualifications;    // 우대 자격요건
    private String welfare;                    // 복리후생
}

