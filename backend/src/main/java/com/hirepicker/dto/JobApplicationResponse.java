package com.hirepicker.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 채용 공고 지원 응답 DTO.
 */
@Getter
@Builder
public class JobApplicationResponse {

    private final boolean success;
    private final String message;
    private final String redirectUrl;

    public static JobApplicationResponse success(String message) {
        return JobApplicationResponse.builder()
                .success(true)
                .message(message)
                .build();
    }

    public static JobApplicationResponse redirect(String redirectUrl, String message) {
        return JobApplicationResponse.builder()
                .success(true)
                .message(message)
                .redirectUrl(redirectUrl)
                .build();
    }

    public static JobApplicationResponse failure(String message) {
        return JobApplicationResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}

