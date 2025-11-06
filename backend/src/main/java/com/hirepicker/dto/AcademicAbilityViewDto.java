package com.hirepicker.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 학력 조회 전용 DTO (학교명 포함)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AcademicAbilityViewDto {
    private Long schoolCode;     // 학교 코드
    private String schoolName;   // 학교명
    private String degree;       // 졸업구분(고졸/학사/석사/박사)
    private String major;        // 학과(전공)
    private BigDecimal majorScore; // 학점
}

