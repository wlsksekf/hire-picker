package com.hirepicker.dto;

import com.hirepicker.entity.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 로그인 요청 DTO
 *
 * 프론트엔드에서 전송하는 로그인 정보를 담는 객체
 * 개인회원과 기업회원을 모두 처리하기 위해 userType을 함께 전송
 */
@Getter
@Setter
public class LoginRequest {

    /**
     * 사용자 식별자
     * - 개인회원(PERSONAL): 이메일 주소 (예: user@example.com)
     * - 기업회원(COMPANY): 로그인 아이디 (예: company123)
     *
     * 주의: @Email 검증을 제거하여 두 형식 모두 허용
     */
    @NotBlank(message = "이메일 또는 아이디는 필수입니다.")
    private String email;

    /**
     * 비밀번호
     * 암호화되지 않은 평문 비밀번호를 전송받음
     * (실제 검증은 AuthService에서 PasswordEncoder로 수행)
     */
    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    /**
     * 회원 타입
     * - PERSONAL: 개인회원
     * - COMPANY: 기업회원
     *
     * 용도: UserDetailsService에서 효율적으로 해당 테이블만 검색하기 위함
     */
    @NotNull(message = "회원 타입은 필수입니다.")
    private UserType userType;
}

