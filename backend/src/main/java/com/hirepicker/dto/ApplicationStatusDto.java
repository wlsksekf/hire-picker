package com.hirepicker.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * 개인회원 지원 현황 응답 DTO.
 */
@Getter
@Builder
public class ApplicationStatusDto {
    // 이력서 식별자
    private final Long resumeIdx;
    // 채용공고 식별자
    private final Long postingIdx;
    // 채용공고 고유 ID (posting_id)
    private final String postingId;
    // 회사명
    private final String companyName;
    // 채용공고 제목
    private final String postingTitle;
    // 지원 상태 (예: APPLIED, PASSED, REJECTED 등)
    private final String status;
    // 지원 일시
    private final LocalDateTime appliedAt;
}

