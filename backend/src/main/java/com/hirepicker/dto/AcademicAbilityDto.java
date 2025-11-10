package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

// 학력 DTO (간단 전달용)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AcademicAbilityDto {
    @JsonProperty("p_user_idx")
    @NotNull(message = "개인회원 PK는 필수 입력 항목입니다.")
    private Long pUserIdx;        // 개인회원 PK

    @NotNull(message = "학교 코드는 필수 입력 항목입니다.")
    @JsonProperty("schoolCode")
    private Long schoolCode;      // 학교 코드

    @NotBlank(message = "학위는 필수 입력 항목입니다.")
    @Size(max = 10, message = "학위는 최대 10자까지 입력 가능합니다.")
    private String degree;        // 학위(문자열)

    @NotBlank(message = "전공은 필수 입력 항목입니다.")
    @Size(max = 100, message = "전공은 최대 100자까지 입력 가능합니다.")
    private String major;         // 전공

    @NotNull(message = "전공 점수는 필수 입력 항목입니다.")
    @DecimalMin(value = "0.0", message = "전공 점수는 0.0 이상이어야 합니다.")
    @DecimalMax(value = "5.0", message = "전공 점수는 5.0 이하여야 합니다.")
    private BigDecimal majorScore;// 전공 점수(2,1)

    @JsonProperty("admissionDate")
    private LocalDate admissionDate; // 입학일

    private LocalDate graduationDate; // 졸업일
}