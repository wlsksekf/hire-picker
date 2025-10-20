package com.hirepicker.config;

import com.hirepicker.config.jwt.JwtAuthenticationFilter;
import com.hirepicker.config.jwt.JwtTokenProvider;
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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter; // 필터 주입

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authManagerBuilder.authenticationProvider(customAuthenticationProvider);
        AuthenticationManager authenticationManager = authManagerBuilder.build();

        http
            .csrf(csrf -> csrf.disable())
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationManager(authenticationManager)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(
                    "/api/auth/**",
                    "/api/users/signup",
                    "/api/oauth2/authorization/google",
                    "/login/oauth2/code/google", // 콜백 주소는 /api가 없음
                    "/swagger-ui.html", 
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    // 정보 조회 API 허용
                    "/api/events/**", 
                    "/api/companies/**", 
                    "/api/postings/**", 
                    "/api/work24/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth.baseUri("/api/oauth2/authorization")) // 로그인 시작 주소의 base-uri 변경
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2LoginSuccessHandler)
            )
            .exceptionHandling(e -> e.authenticationEntryPoint(customAuthenticationEntryPoint));

        return http.build();
    }
}