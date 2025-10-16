package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JobDto(
    String id,
    String companyName,
    String title,
    String employmentType,
    String location // API에서는 '기업구분' 데이터가 여기 매핑됩니다.
) {}
