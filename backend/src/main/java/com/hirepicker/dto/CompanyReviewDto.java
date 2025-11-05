package com.hirepicker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyReviewDto {
    private Long companyIdx;
    private String companyName;
}
