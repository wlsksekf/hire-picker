package com.hirepicker.dto.ai;

// AI가 생성할 4가지 항목을 정확히 매핑하는 record (DTO)
public record FullResumeDraftDto(
    String growthProcess,    // 성장과정
    String jobCompetencies,  // 업무 관련 역량
    String prosAndCons,      // 성격 장단점
    String aspirations       // 입사 후 포부
) {}
