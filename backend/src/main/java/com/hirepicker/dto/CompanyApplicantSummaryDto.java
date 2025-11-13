package com.hirepicker.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 기업회원이 공고별 지원자 목록을 볼 때 사용하는 DTO.
 */
@Getter
@Builder
@AllArgsConstructor
public class CompanyApplicantSummaryDto {

    private final Long postingIdx; // 조회 중인 공고 PK
    private final Long resumeIdx; // 지원자가 제출한 이력서 PK
    private final String applicantName; // 지원자 실명
    private final String applicantEmail; // 지원자 이메일
    private final String applicantPhone; // 지원자 연락처
    private final String resumeTitle; // 제출된 이력서 제목
    private final LocalDateTime appliedAt; // 지원 일시
    private final String statusCode; // 원본 상태 코드
    private final String statusLabel; // 프론트 표시용 상태 라벨
}

