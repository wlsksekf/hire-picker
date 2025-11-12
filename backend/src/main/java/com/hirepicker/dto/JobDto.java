package com.hirepicker.dto;

import java.util.List;
import java.util.Map;

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
    String location, // 근무 지역
    String imgUrl,
    String searchTerm,
    String companyType,
    Map<String, List<String>> filters,
    String experience_level, // 학력
    String jobType,
    Boolean internal, // 우리 사이트 공고 여부
    String applyUrl // 외부 지원 링크

) {}
