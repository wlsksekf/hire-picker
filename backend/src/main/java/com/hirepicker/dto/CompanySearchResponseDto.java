package com.hirepicker.dto;

import com.hirepicker.entity.Company;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanySearchResponseDto {
    private Long companyIdx;
    private String companyName;

    public static CompanySearchResponseDto fromEntity(Company company) {
        return new CompanySearchResponseDto(
            company.getCompanyIdx(),
            company.getCompanyName()
        );
    }
}
