package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequestDto {
    @JsonProperty("targetIdx")
    private Long targetIdx;
    @JsonProperty("reason")
    private String reason;
    @JsonProperty("reportDate")
    private String reportDate;

    
}
