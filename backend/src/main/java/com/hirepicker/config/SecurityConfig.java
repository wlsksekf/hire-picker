package com.hirepicker.config;

import com.hirepicker.config.filter.JwtAuthenticationFilter;
import com.hirepicker.handler.CustomAuthenticationEntryPoint;
import com.hirepicker.handler.OAuth2LoginSuccessHandler;
import com.hirepicker.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // Spring의 설정 클래스임을 선언
@EnableWebSecurity // Spring Security 활성화
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService; // 커스텀 OAuth2 사용자 서비스
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler; // OAuth2 로그인 성공 핸들러
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint; // 커스텀 인증 진입점
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // JWT 인증 필터

    // AuthenticationManager를 Bean으로 등록
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean // Spring의 빈으로 등록
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화
            .httpBasic(basic -> basic.disable()) // HTTP Basic 인증 비활성화
            .formLogin(form -> form.disable()) // 폼 로그인 비활성화
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션을 사용하지 않음 (상태 없음)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**", "/api/users/**", "/api/work24/**", "/actuator/**", "/api/health/**", "/api/manage/**", "/confirm/**", "/confirm-billing", "/issue-billing-key", "/callback-auth", "/fail", "/swagger-ui/**", "/api-docs/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) // JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
            .oauth2Login(oauth2 -> oauth2 // OAuth2 로그인 설정
                .authorizationEndpoint(auth -> auth.baseUri("/api/oauth2/authorization"))
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2LoginSuccessHandler)
            )
            .exceptionHandling(e -> e.authenticationEntryPoint(customAuthenticationEntryPoint));

        return http.build();
    }
}
