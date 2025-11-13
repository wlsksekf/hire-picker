package com.hirepicker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ReportRequestDto {
    private Long targetIdx;      // 신고 대상(게시글) idx
    private String reason;       // 신고 사유 (radio 선택)
    private String reportDate;   // 신고 일시 (ISO String 등)
}
