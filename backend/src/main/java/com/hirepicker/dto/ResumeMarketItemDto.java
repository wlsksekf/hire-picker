package com.hirepicker.dto;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.Builder;
import lombok.Getter;

/**
 * 이력서 거래소 노출용 DTO
 */
@Getter
@Builder
public class ResumeMarketItemDto {
    private final Long resumeId;
    private final String title;
    private final String ownerName;
    private final String ownerJobTitle;
    private final String summary;
    private final int creditCost;
    private final String highlightStatus;
    private final Map<String, Long> statusSummary;
    private final boolean purchased;
    private final String imageUrl;
    private final LocalDateTime updatedAt;
}

