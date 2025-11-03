package com.hirepicker.dto;

import com.hirepicker.entity.Gender;
import com.hirepicker.entity.Platform;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequestDto {
    
    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    private String passwordConfirm;

    @NotBlank(message = "닉네임은 필수입니다.")
    private String nickname;

    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    private Gender gender; // null 허용

    private String phone_number;
    
    private String address;
    
    @NotBlank(message = "인증 코드는 필수입니다.")
    private String verificationCode;
    
    private Platform platform = Platform.LOCAL;
}