package com.hirepicker.exception;

import org.springframework.security.core.AuthenticationException;

/**
 * 소셜 로그인으로 가입한 계정이 비밀번호 없이 로그인을 시도할 때 발생하는 예외
 */
public class SocialAccountNeedsPasswordException extends AuthenticationException {
    public SocialAccountNeedsPasswordException(String msg) {
        super(msg);
    }
}