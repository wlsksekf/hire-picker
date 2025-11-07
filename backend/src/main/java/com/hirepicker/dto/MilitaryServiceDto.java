package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 병역 DTO (간단 전달용)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MilitaryServiceDto {
    @JsonProperty("p_user_idx")
    @NotNull(message = "개인회원 PK는 필수 입력 항목입니다.")
    private Long pUserIdx;           // 개인회원 PK

    @NotBlank(message = "병역 유형은 필수 입력 항목입니다.")
    @Size(max = 10, message = "병역 유형은 최대 10자까지 입력 가능합니다.")
    private String serviceType;      // 병역 유형

    @Size(max = 10, message = "병과는 최대 10자까지 입력 가능합니다.")
    private String militaryBranch;   // 병과

    @Size(max = 10, message = "계급은 최대 10자까지 입력 가능합니다.")
    private String militaryRank;     // 계급

    @Size(max = 20, message = "복무 기간은 최대 20자까지 입력 가능합니다.")
    private String periodOfService;  // 복무 기간

    @Size(max = 20, message = "면제 사유는 최대 20자까지 입력 가능합니다.")
    private String reasonForExemption; // 면제 사유
}