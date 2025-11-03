package com.hirepicker.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// 기업 정보 DTO (Data Transfer Object)
@JsonIgnoreProperties(ignoreUnknown = true) // JSON 역직렬화 시 알 수 없는 속성 무시
public record CompanyDto(
                Long companyIdx, // 기업 인덱스 (Primary Key)
                String id, // 기업 ID
                String name, // 기업명
                String summary, // 기업 소개 요약
                String homepage, // 홈페이지 URL
                String businessNumber, // 사업자 등록번호
                String logoUrl, // 로고 URL
                String companyType, // 기업 형태
                String ceoNm, // 대표자명
                String adres, // 주소
                String employeeCount, // 직원 수
                String corpCode, // 기업 코드
                String status,
                Date regDate,
                Long sales_amount,
                String welfare_benefits) {
}