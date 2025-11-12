package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// 채용 행사 정보 DTO (Data Transfer Object)
@JsonIgnoreProperties(ignoreUnknown = true) // JSON 역직렬화 시 알 수 없는 속성 무시
public record EventDto(
    String id, // 행사 ID
    String title, // 행사명
    String period, // 행사 기간
    String location, // 행사 지역
    String eventStatus // 행사 상태 추가
) {}