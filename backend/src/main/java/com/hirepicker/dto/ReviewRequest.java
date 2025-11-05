package com.hirepicker.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private String review;
    private String reviewerType;
    private Long reviewIdx;
    private Long pUserIdx;
}
