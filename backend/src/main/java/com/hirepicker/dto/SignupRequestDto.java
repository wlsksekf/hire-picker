package com.hirepicker.dto;

import com.hirepicker.entity.Gender; // Gender Enum이 있다면
import com.hirepicker.entity.Platform;
import lombok.Data;
// import javax.validation.constraints.*; // (선택) 유효성 검사 어노테이션 추가

@Data
public class SignupRequestDto {
    
    // '테이블 구조 요약.txt' (personal_user) 기반
    
    // @NotBlank(message = "이메일은 필수입니다.")
    // @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    // @NotBlank(message = "비밀번호는 필수입니다.")
    // @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;

    // @NotBlank(message = "닉네임은 필수입니다.")
    private String nickname;

    // @NotBlank(message = "이름은 필수입니다.")
    private String name;

    private Gender gender; // (Enum 타입 또는 String)

    private String phone_number;
    
    private String address; // ★ Google Places API로 채워질 주소
    
    // @NotBlank(message = "인증 코드는 필수입니다.")
    private String verificationCode; // ★ 이메일 인증 코드
    
    private Platform platform = Platform.LOCAL; // 자체 회원가입은 'LOCAL'
}