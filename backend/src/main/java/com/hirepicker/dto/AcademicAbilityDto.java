package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private Long pUserIdx;        // 개인회원 PK
    @JsonProperty("school_code")
    private Long schoolCode;      // 학교 코드
    private String degree;        // 학위(문자열)
    private String major;         // 전공
    private BigDecimal majorScore;// 전공 점수(2,1)
    private LocalDate graduationDate; // 졸업일
}

