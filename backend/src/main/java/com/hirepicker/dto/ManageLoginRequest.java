package com.hirepicker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManageLoginRequest {

    @NotBlank(message = "id는 필수입니다.")
    private String id; // 관리자 로그인 아이디

    @NotBlank(message = "password는 필수입니다.")
    private String password; // 관리자 비밀번호
}

