package com.hirepicker.dto.ai;

// AI 이력서 초안 생성 요청 시 본문에 담길 데이터를 매핑하는 record (DTO)
public record ResumeDraftRequestDto(
    String userData,       // 이력서 작성을 위한 사용자 정보 (경력, 기술 등)
    String jobPostingData  // 지원하려는 채용 공고 정보
) {}
