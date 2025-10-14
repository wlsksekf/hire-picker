package com.hirepicker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // JWT를 쓸 예정이므로 CSRF는 비활성화
            .csrf(AbstractHttpConfigurer::disable)

            // X-Frame-Options 헤더를 SAMEORIGIN으로 설정
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
            )

            .authorizeHttpRequests(authorize -> authorize
                // 🚨 임시 설정: CI/CD 테스트를 위해 루트 경로만 인증 없이 접근 허용
                .requestMatchers("/").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers("/actuator/**").permitAll() // 헬스체크를 위해 /actuator/** 경로 허용

                // Swagger UI 접근 허용
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/api-docs/swagger-config",
                    "/api-docs",
                    "/webjars/**"
                ).permitAll()

                // API 경로 허용
                .requestMatchers("/api/**").permitAll()

                // 나머지 경로는 일단 보호 상태로 둠.
                .anyRequest().authenticated()
            );

        // TODO: 나중에 JWT 관련 설정을 여기에 추가해야 함

        return http.build();
    }

    // TODO: PasswordEncoder Bean을 여기에 추가해야 함
}