package com.hirepicker.config.filter;

import com.hirepicker.config.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT 인증 필터
 * - HttpOnly 쿠키에서 Access Token 추출 및 검증
 * - Token Rotation 지원 (Refresh Token은 별도 엔드포인트에서 처리)
 * - 경로 기반 필터 제외 (AntPathMatcher 사용)
 */
@Component // Spring Bean으로 등록
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider; // JWT 토큰 제공자
    private final AntPathMatcher pathMatcher = new AntPathMatcher(); // 경로 매칭 유틸리티

    /**
     * 인증 필터를 제외할 경로 패턴 목록
     * - AntPathMatcher를 사용하여 와일드카드 패턴 지원
     * - SecurityConfig의 permitAll()과 동기화 필요
     */
    private static final List<String> PERMIT_ALL_PATTERNS = Arrays.asList(
            "/api/users/signup",
            "/api/oauth2/**",
            "/login/oauth2/code/**",
            "/api/auth/**",
            "/api/work24/**",
            "/actuator/**",
            "/api/health/**",
            "/confirm/**",
            "/confirm-billing",
            "/issue-billing-key",
            "/callback-auth",
            "/fail",
            "/swagger-ui/**",
            "/api-docs/**",
            "/error",
            "/api/payment/webhook",
            "/chat/**",
            "/ws",
            "/ws/**",
            "/api/ai/upload-image",
            "/api/search",
            "/api/companies/search" // 공개 검색
    );

    /**
     * GET 메서드만 허용되는 경로 패턴
     */
    private static final List<String> GET_ONLY_PERMIT_PATTERNS = Arrays.asList(
            "/api/posts",
            "/api/posts/*" // 단일 게시글 조회 (숫자 ID)
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. 전체 공개 경로 확인 (모든 HTTP 메서드 허용)
        for (String pattern : PERMIT_ALL_PATTERNS) {
            if (pathMatcher.match(pattern, path)) {
                return true; // 필터 미적용
            }
        }

        // 2. GET 전용 공개 경로 확인
        if ("GET".equalsIgnoreCase(method)) {
            for (String pattern : GET_ONLY_PERMIT_PATTERNS) {
                if (pathMatcher.match(pattern, path)) {
                    return true; // 필터 미적용
                }
            }
        }

        // 3. 그 외 모든 경로는 필터 적용
        return false;
    }


    /**
     * 실제 필터링 로직
     * - HttpOnly 쿠키에서 Access Token 추출
     * - 토큰 유효성 검증 후 SecurityContext에 인증 정보 설정
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        log.debug("[JwtFilter] Processing request: {} {}", request.getMethod(), request.getRequestURI());
        
        String jwt = resolveTokenFromCookie(request); // 쿠키에서 토큰 추출

        if (StringUtils.hasText(jwt)) {
            // 토큰 유효성 검증
            if (jwtTokenProvider.validateToken(jwt)) {
                Authentication authentication = jwtTokenProvider.getAuthentication(jwt); // 인증 정보 조회
                SecurityContextHolder.getContext().setAuthentication(authentication); // SecurityContext에 인증 정보 저장
                
                log.debug("[JwtFilter] Authentication set for user: {}", authentication.getName());
            } else {
                log.warn("[JwtFilter] Invalid or expired JWT token");
            }
        } else {
            log.debug("[JwtFilter] No JWT token found in cookies");
        }

        filterChain.doFilter(request, response); // 다음 필터로 전달
    }

    /**
     * HttpOnly 쿠키에서 Access Token 추출
     * - Authorization 헤더 지원 제거 (쿠키 전용)
     * - XSS 공격 방지를 위해 HttpOnly 쿠키만 사용
     */
    private String resolveTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    log.trace("[JwtFilter] Access token found in cookie");
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
