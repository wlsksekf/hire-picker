package com.hirepicker.config.filter;

import com.hirepicker.config.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component // Spring Bean으로 등록
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTHORIZATION_HEADER = "Authorization"; // 인증 헤더 이름
    public static final String BEARER_PREFIX = "Bearer "; // Bearer 접두사

    private final JwtTokenProvider jwtTokenProvider; // JWT 토큰 제공자

@Override
protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();
    String method = request.getMethod();

        // 1. permitAll()로 설정된 경로 리스트
        //    주의: "/api/auth/**"는 "/api/auth/"로 시작하는지 검사해야 함
        List<String> permitAllPaths = List.of(
                "/api/users/signup",
                "/api/oauth2/", // /api/oauth2/**
                "/login/oauth2/code/", // /login/oauth2/code/**
                "/api/auth/", // /api/auth/**
                "/api/work24/", // /api/work24/**
                "/actuator/", // /actuator/**
                "/api/health/", // /api/health/**
                "/api/manage/", // /api/manage/**
                "/confirm/", // /confirm/**
                "/confirm-billing",
                "/issue-billing-key",
                "/callback-auth",
                "/fail",
                "/swagger-ui/", // /swagger-ui/**
                "/api-docs/", // /api-docs/**
                "/error",
                "/api/companies/", // /api/companies/**
                "/api/payment/webhook",
                "/chat/", // /chat/**
                "/ws", // /ws, /ws/**
                "/api/ai/upload-image",
                "/api/search"
                

        );

    // ★ GET /api/posts와 /api/posts/{postIdx}는 필터 미적용 (비회원 조회 가능)
    if (method.equals("GET") && (path.equals("/api/posts") || path.matches("/api/posts/\\d+"))) {
        return true;
    }

    // ★ /api/posts/me는 필터를 적용해야 함 (인증 정보 필요) - 반환값: false
    if (path.equals("/api/posts/me")) {
        return false; // 필터 실행
    }

    // ★ POST /api/posts/write는 필터를 적용해야 함 (인증 필요)
    if (method.equals("POST") && path.equals("/api/posts/write")) {
        return false; // 필터 실행
    }

    for (String permitPath : permitAllPaths) {
        if (path.startsWith(permitPath)) {
            return true;
        }
    }

    return false;
}


    // 실제 필터링 로직
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        log.info("[Filter] JwtAuthenticationFilter is running for URI: {}", request.getRequestURI());
        String jwt = resolveToken(request); // 요청에서 토큰 추출

        // 토큰이 유효한 경우
        if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
            log.info("[Filter] Valid JWT token found. Setting authentication in context.");
            Authentication authentication = jwtTokenProvider.getAuthentication(jwt); // 인증 정보 조회

            // ★ [디버깅용] 토큰 클레임 정보 로그 출력
            log.info("[Filter] Authenticated user: Principal: {}, Authorities: {}", authentication.getPrincipal(), authentication.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication); // SecurityContext에 인증 정보 저장
        } else {
            log.info("[Filter] No valid JWT token found.");
        }

        filterChain.doFilter(request, response); // 다음 필터로 전달
    }

    // 요청 헤더 또는 쿠키에서 토큰 정보를 추출하는 메서드
    private String resolveToken(HttpServletRequest request) {
        // 1. Authorization 헤더에서 토큰 추출 시도
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        // 2. 쿠키에서 accessToken 추출 시도
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
