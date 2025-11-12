package com.hirepicker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 채용 공고 지원 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class JobApplicationRequest {

    @NotNull(message = "이력서를 선택해 주세요.")
    private Long resumeId;
}

