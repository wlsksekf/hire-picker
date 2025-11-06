package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 병역 DTO (간단 전달용)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MilitaryServiceDto {
    @JsonProperty("p_user_idx")
    private Long pUserIdx;           // 개인회원 PK
    private String serviceType;      // 병역 유형
    private String militaryBranch;   // 병과
    private String militaryRank;     // 계급
    private String periodOfService;  // 복무 기간
    private String reasonForExemption; // 면제 사유
}

