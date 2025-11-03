package com.hirepicker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompanySignupRequestDto {

    @NotBlank(message = "아이디는 필수입니다.")
    private String id; // 로그인 아이디

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    @NotBlank(message = "담당자 이름은 필수입니다.")
    private String name; // 담당자 이름

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "전화번호는 필수입니다.")
    private String phone_number;

    @NotBlank(message = "인증 코드는 필수입니다.")
    private String verificationCode; // 이메일 인증 코드

    @NotNull(message = "회사를 선택해주세요.")
    private Long companyIdx; // 선택된 회사의 ID
}
