package com.hirepicker.dto.ai;

import com.fasterxml.jackson.annotation.JsonInclude;

// AI 이력서 초안 생성 요청 시 본문에 담길 데이터를 매핑하는 record (DTO)
@JsonInclude(JsonInclude.Include.NON_NULL) // JSON으로 변환 시 null인 필드는 제외
public record ResumeDraftRequestDto(
    String userData,       // 이력서 작성을 위한 사용자 정보 (경력, 기술 등)
    String jobPostingData, // 지원하려는 채용 공고 정보
    FullResumeDraftDto resumeDraft // (선택) 사용자가 수정을 요청한 기존 자기소개서 초안
) {}
