package com.hirepicker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SchoolDto {
    private Long schoolCode; // 학교 고유 코드
    private String schoolName; // 학교명
    private String campus; // 캠퍼스 정보(1캠퍼스/2캠퍼스 등)
}
