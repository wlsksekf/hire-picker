package com.hirepicker.dto;

import com.hirepicker.entity.Company;
import lombok.Builder;
import lombok.Data;

import java.util.Date;

/**
 * 회사 정보 DTO
 *
 * 목적: Entity를 직접 반환하지 않고 DTO로 변환하여 반환
 * - 순환 참조 방지
 * - 필요한 필드만 선택적으로 노출
 * - JSON 직렬화 최적화
 */
@Data
@Builder
public class CompanyInfoDto {
    private Long companyIdx;           // 회사 ID
    private String companyName;        // 회사명
    private String description;        // 회사 소개
    private String websiteUrl;         // 웹사이트 URL
    private String businessNumber;     // 사업자등록번호
    private String logoUrl;            // 로고 URL
    private String companyType;        // 회사 유형
    private String ceoName;            // 대표자명
    private String address;            // 주소
    private String employeeCount;      // 직원 수
    private String corpCode;           // 법인 코드
    private String status;             // 상태
    private Date regDate;              // 등록일
    private Long salesAmount;          // 매출액
    private String welfareBenefits;    // 복리후생
    private String imgPath;            // 이미지 경로

    /**
     * Entity → DTO 변환 (정적 팩토리 메서드)
     *
     * @param company Company 엔티티
     * @return CompanyInfoDto
     */
    public static CompanyInfoDto fromEntity(Company company) {
        return CompanyInfoDto.builder()
                .companyIdx(company.getCompanyIdx())
                .companyName(company.getCompanyName())
                .description(company.getDescription())
                .websiteUrl(company.getWebsiteUrl())
                .businessNumber(company.getBusinessNumber())
                .logoUrl(company.getLogoUrl())
                .companyType(company.getCompanyType())
                .ceoName(company.getCeoName())
                .address(company.getAddress())
                .employeeCount(company.getEmployeeCount())
                .corpCode(company.getCorpCode())
                .status(company.getStatus())
                .regDate(company.getRegDate())
                .salesAmount(company.getSalesAmount())
                .welfareBenefits(company.getWelfareBenefits())
                .imgPath(company.getImgPath())
                .build();
    }
}

