package com.hirepicker.util;

import java.util.Arrays;

import org.springframework.core.env.Environment;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.hirepicker.config.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 쿠키 관련 유틸리티 클래스
 * - HttpOnly, Secure, SameSite 속성을 일관되게 적용
 * - 환경별(dev/prod) 설정 자동 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CookieUtils {

    private final Environment environment;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 프로덕션 환경 여부 확인
     */
    private boolean isProduction() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }

    /**
     * 환경별 SameSite 정책 반환
     * - 프로덕션: Strict (CSRF 방어 강화)
     * - 개발: Lax (로컬 개발 편의성)
     */
    private String getSameSitePolicy() {
        return isProduction() ? "Strict" : "Lax";
    }

    /**
     * Access Token 쿠키 생성
     */
    public ResponseCookie createAccessTokenCookie(String accessToken) {
        long maxAge = jwtTokenProvider.getAccessTokenValidityInMilliseconds() / 1000;
        
        return ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true) // XSS 공격 방지
                .secure(isProduction()) // HTTPS에서만 전송 (프로덕션)
                .path("/")
                .maxAge(maxAge)
                .sameSite(getSameSitePolicy()) // CSRF 방어
                .build();
    }

    /**
     * Refresh Token 쿠키 생성
     */
    public ResponseCookie createRefreshTokenCookie(String refreshToken) {
        long maxAge = jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000;
        
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true) // XSS 공격 방지
                .secure(isProduction()) // HTTPS에서만 전송 (프로덕션)
                .path("/")
                .maxAge(maxAge)
                .sameSite(getSameSitePolicy()) // CSRF 방어
                .build();
    }

    /**
     * Access Token 쿠키 삭제 (로그아웃용)
     */
    public ResponseCookie createDeleteAccessTokenCookie() {
        return ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(isProduction())
                .path("/")
                .maxAge(0) // 즉시 만료
                .sameSite(getSameSitePolicy())
                .build();
    }

    /**
     * Refresh Token 쿠키 삭제 (로그아웃용)
     */
    public ResponseCookie createDeleteRefreshTokenCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isProduction())
                .path("/")
                .maxAge(0) // 즉시 만료
                .sameSite(getSameSitePolicy())
                .build();
    }
}

