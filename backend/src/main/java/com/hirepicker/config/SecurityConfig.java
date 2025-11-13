package com.hirepicker.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.hirepicker.config.filter.JwtAuthenticationFilter;
import com.hirepicker.handler.CustomAuthenticationEntryPoint;
import com.hirepicker.handler.OAuth2LoginSuccessHandler;
import com.hirepicker.service.CustomOAuth2UserService;

import lombok.RequiredArgsConstructor;

@Configuration // Spring의 설정 클래스임을 선언
@EnableWebSecurity // Spring Security 활성화
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService; // 커스텀 OAuth2 사용자 서비스
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler; // OAuth2 로그인 성공 핸들러
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint; // 커스텀 인증 진입점
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // JWT 인증 필터
    private final Environment env; // 환경 변수 접근을 위한 Environment 객체

    // AuthenticationManager를 Bean으로 등록
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean // Spring의 빈으로 등록
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        boolean isProduction = Arrays.asList(env.getActiveProfiles()).contains("prod");
        String failureUrl = isProduction ? "https://hirepicker.duckdns.org/oauth/fail"
                : "http://localhost:3000/oauth/fail";

        http
                // 1. CORS 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. 기본 설정 (CSRF 비활성화, HTTP Basic/Form Login 비활성화)
                // HttpOnly + SameSite 쿠키로 충분히 보호됩니다.
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable()) // HTTP Basic 인증 비활성화
                .formLogin(form -> form.disable()) // 폼 로그인 비활성화
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션을 사용하지 않음 (상태 없음)

                // 3. HTTP 요청 권한 설정
                .authorizeHttpRequests(authorize -> authorize
                        // 회원가입 및 게시글 조회는 모두 허용
                        .requestMatchers(HttpMethod.POST, "/api/users/signup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                        .requestMatchers("/api/comments/**").authenticated()

                        // OAuth2 관련 엔드포인트는 모두 허용
                        .requestMatchers("/api/oauth2/**", "/login/oauth2/code/**").permitAll()

                        // 사용자 정보 조회는 인증 필요
                        .requestMatchers("/api/users/me").authenticated()

                        // 회사 정보 조회는 인증 필요 (기업회원 전용)
                        .requestMatchers("/api/companies/my").authenticated()

                        // 회사 검색은 공개 (누구나 조회 가능)
                        .requestMatchers(HttpMethod.GET, "/api/companies/search").permitAll()
                        // 기타 공개 API 및 웹훅, 채팅 관련 엔드포인트는 모두 허용
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/webhooks/**", // 카카오 웹훅 엔드포인트 추가
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
                                "/api/companies/**",
                                "/api/dart/**",
                                "/api/national-pension/**",
                                "/api/job-postings/**",
                                "/signup/company/**",
                                "/api/payment/webhook", // 웹훅 엔드포인트는 모두 허용
                                "/chat/**",
                                "/ws",
                                "/ws/**",
                                "/chat/history/**",
                                "/api/v1/ai-chat",
                                "/api/v1/ai-search",
                                "/api/search/**", "/api/calendar/**",
                                "/api/company-alarms/**",
                                "/api/bookmark/toggle",
                                "/api/inquiry/submit",
                                "/api/inquiries",
                                "/inquiries/{inquiryIdx}/answer",
                                "/api/bookmark/check",

                                "/api/bookmark/check",
                                "/api/manage/**")
                        .permitAll()

                        // 이미지 업로드 엔드포인트는 인증 없이 허용
                        .requestMatchers(HttpMethod.POST, "/api/ai/upload-image").permitAll()
                        // 기타 공개 API 및 웹훅, 채팅 관련 엔드포인트는 모두 허용
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/webhooks/**", // 카카오 웹훅 엔드포인트 추가
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
                                "/api/dart/**",
                                "/api/national-pension/**",
                                "/signup/company/**",
                                "/api/payment/webhook", // 웹훅 엔드포인트는 모두 허용
                                "/chat/**",
                                "/ws",
                                "/ws/**",
                                "/chat/history/**",
                                "/api/v1/ai-chat",
                                "/api/v1/ai-search",
                                "/api/search", "/api/calendar/**",
                                "/api/company-alarms/**")
                        .permitAll()

                        // 이미지 업로드 엔드포인트는 인증 없이 허용
                        .requestMatchers(HttpMethod.POST, "/api/ai/upload-image").permitAll()

                        // 결제, AI, 크레딧 관련 API는 인증 필요
                        .requestMatchers("/api/manage/auth/login").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/manage/job-postings/import/rapid").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/manage/job-postings/import/rapid").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/work24/sync/rapid-jobs").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/work24/sync/rapid-jobs").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/work24/sync/jsearch-jobs").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/work24/sync/jsearch-jobs").permitAll()
                        .requestMatchers("/api/manage/**").hasAuthority("ROLE_MANAGE")
                        .requestMatchers("/api/payment/**").authenticated()
                        .requestMatchers("/api/ai/**").authenticated() // [AI 기능 추가] AI 관련 API는 인증된 사용자만 접근 가능
                        .requestMatchers("/api/credits/**").authenticated() // [크레딧 기능 추가] 크레딧 관련 API는 인증된 사용자만 접근 가능

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated())

                // 4. 커스텀 필터 추가 (JWT)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 5. OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(
                                auth -> auth.baseUri("/api/oauth2/authorization"))
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureUrl(failureUrl))

                // 6. 예외 처리 (인증 예외)
                .exceptionHandling(e -> e.authenticationEntryPoint(customAuthenticationEntryPoint));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:3000", "https://hirepicker.duckdns.org"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 모든 경로에 대해 이 설정 적용
        return source;
    }
}
