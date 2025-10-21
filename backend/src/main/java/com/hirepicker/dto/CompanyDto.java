package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CompanyDto(
    String id,
    String name,
    String summary,
    String homepage,
    String businessNumber,
    String logoUrl,
    String companyType,
    String ceoNm,
    String adres,
    String employeeCount,
    String corpCode
) {}