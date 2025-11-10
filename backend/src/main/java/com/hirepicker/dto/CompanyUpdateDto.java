package com.hirepicker.dto;

import lombok.Data;

/**
 * 회사 정보 업데이트 DTO
 *
 * 기업회원이 마이페이지에서 수정 가능한 필드만 포함
 * - 회사명, 대표자명, 주소, 소개, 사업자등록번호, 웹사이트, 직원 수
 */
@Data
public class CompanyUpdateDto {
    private String companyName;        // 회사명
    private String ceoName;            // 대표자명
    private String address;            // 주소
    private String description;        // 회사 소개
    private String businessNumber;     // 사업자등록번호
    private String websiteUrl;         // 웹사이트 URL
    private String employeeCount;      // 직원 수
}

