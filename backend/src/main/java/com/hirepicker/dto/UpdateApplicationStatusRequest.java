package com.hirepicker.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 기업회원이 지원 상태를 갱신할 때 사용하는 요청 DTO.
 */
@Getter
@NoArgsConstructor
public class UpdateApplicationStatusRequest {

    private String statusCode; // 변경할 상태 코드
}

