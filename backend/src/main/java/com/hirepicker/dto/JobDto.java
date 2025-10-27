package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


import lombok.Builder;

// 채용 공고 정보 DTO (Data Transfer Object)
@JsonIgnoreProperties(ignoreUnknown = true) // JSON 역직렬화 시 알 수 없는 속성 무시
@Builder // 빌더 패턴을 사용하여 객체 생성
public record JobDto(
    String id, // 공고 ID
    String companyName, // 회사명
    String title, // 공고 제목
    String employmentType, // 고용 형태
    String location // 근무 지역
) {}