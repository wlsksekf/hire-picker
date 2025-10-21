package com.hirepicker.config;

import com.hirepicker.config.jwt.JwtAuthenticationFilter;
import com.hirepicker.config.security.CustomAuthenticationProvider;
import com.hirepicker.handler.CustomAuthenticationEntryPoint;
import com.hirepicker.handler.OAuth2LoginSuccessHandler;
import com.hirepicker.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // Spring의 설정 클래스임을 선언
@EnableWebSecurity // Spring Security 활성화
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class SecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider; // 커스텀 인증 공급자
    private final CustomOAuth2UserService customOAuth2UserService; // 커스텀 OAuth2 사용자 서비스
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler; // OAuth2 로그인 성공 핸들러
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint; // 커스텀 인증 진입점
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // JWT 인증 필터

    @Bean // Spring의 빈으로 등록
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authManagerBuilder.authenticationProvider(customAuthenticationProvider);
        AuthenticationManager authenticationManager = authManagerBuilder.build();

        http
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화
            .httpBasic(basic -> basic.disable()) // HTTP Basic 인증 비활성화
            .formLogin(form -> form.disable()) // 폼 로그인 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션을 사용하지 않음 (상태 없음)
            .authenticationManager(authenticationManager) // 인증 관리자 설정
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers( // 다음 경로에 대한 요청은 모두 허용
                    "/api/auth/**",
                    "/api/users/signup",
                    "/api/oauth2/**",
                    "/login/oauth2/code/google",
                    "/swagger-ui.html", 
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    // 정보 조회 API 허용
                    "/api/events/**", 
                    "/api/companies/**", 
                    "/api/postings/**", 
                    "/api/work24/**"
                ).permitAll()
                .anyRequest().authenticated() // 그 외의 모든 요청은 인증 필요
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) // JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth.baseUri("/api/oauth2/authorization")) // OAuth2 로그인 시작 주소 변경
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService)) // 커스텀 OAuth2 사용자 서비스 설정
                .successHandler(oAuth2LoginSuccessHandler) // OAuth2 로그인 성공 핸들러 설정
            )
            .exceptionHandling(e -> e.authenticationEntryPoint(customAuthenticationEntryPoint)); // 예외 처리 시 커스텀 인증 진입점 사용

        return http.build();
    }
}
