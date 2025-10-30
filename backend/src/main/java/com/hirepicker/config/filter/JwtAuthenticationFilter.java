package com.hirepicker.config.filter;

import com.hirepicker.config.jwt.JwtTokenProvider; // Added import
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component // Spring Bean으로 등록
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String AUTHORIZATION_HEADER = "Authorization"; // 인증 헤더 이름
    public static final String BEARER_PREFIX = "Bearer "; // Bearer 접두사

    private final JwtTokenProvider jwtTokenProvider; // JWT 토큰 제공자

    // JWT 필터가 적용되지 않을 경로 목록
    private static final List<String> EXCLUDE_URLS = Arrays.asList(
            "/api/auth/**",
            "/api/oauth2/**",
            "/login/oauth2/code/google",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/api-docs/**",
            "/actuator/**",
            "/api/health/**",
            "/api/manage/**",
            "/confirm/**",
            "/confirm-billing",
            "/issue-billing-key",
            "/callback-auth",
            "/fail",
            "/api/events/**",
            "/api/companies/**",
            "/api/postings/**",
            "/api/work24/**"
    );

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) throws ServletException {
        String requestUri = request.getRequestURI();
        AntPathMatcher pathMatcher = new AntPathMatcher();
        boolean shouldNotFilter = EXCLUDE_URLS.stream().anyMatch(uri -> pathMatcher.match(uri, requestUri));
        log.info("[Filter] Request URI: {} -> shouldNotFilter: {}", requestUri, shouldNotFilter);
        return shouldNotFilter;
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