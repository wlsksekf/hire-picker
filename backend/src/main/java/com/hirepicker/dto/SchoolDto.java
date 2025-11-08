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
    private Long schoolCode;
    private String schoolName;
    private String campus; // 캠퍼스 정보 추가
}
