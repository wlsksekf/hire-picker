package com.hirepicker.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화
                .httpBasic(basic -> basic.disable()) // HTTP Basic 인증 비활성화
                .formLogin(form -> form.disable()) // 폼 로그인 비활성화
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션을 사용하지 않음
                                                                                 // (상태 없음)
                .authorizeHttpRequests(authorize -> authorize

                        .requestMatchers(HttpMethod.POST, "/api/users/signup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts/*").permitAll()
                        .requestMatchers("/api/oauth2/**", "/login/oauth2/code/**").permitAll()
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/auth/**", "/api/work24/**", "/actuator/**",
                                "/api/health/**", "/api/manage/**", "/confirm/**",
                                "/confirm-billing", "/issue-billing-key",
                                "/callback-auth", "/fail", "/swagger-ui/**",
                                "/api-docs/**", "/error", "/api/companies/**",
                                "/api/dart/**", "/api/national-pension/**",
                                "/signup/company/**", "/api/calendar/**")
                        .permitAll()
                        .requestMatchers("/api/payment/webhook").permitAll() // 웹훅 엔드포인트는 모두 허용
                        .requestMatchers("/chat/**", "/ws", "/ws/**", "/chat/history/**")
                        .permitAll()
                        .requestMatchers("/api/payment/**").authenticated() // 나머지 결제 관련 API는 인증
                                                                            // 필요
                        .requestMatchers(HttpMethod.POST, "/api/ai/upload-image").permitAll() // 이미지
                                                                                              // 업로드
                                                                                              // 엔드포인트는
                                                                                              // 인증
                                                                                              // 없이
                                                                                              // 허용
                        .requestMatchers("/api/ai/**").authenticated() // [AI 기능 추가] AI 관련 API는
                                                                       // 인증된 사용자만 접근 가능
                        .requestMatchers("/api/credits/**").authenticated() // [크레딧 기능 추가] 크레딧
                                                                            // 관련 API는 인증된 사용자만
                                                                            // 접근 가능
                        .anyRequest().authenticated()

                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) // JWT
                                                                                                      // 인증
                                                                                                      // 필터를
                                                                                                      // UsernamePasswordAuthenticationFilter
                                                                                                      // 앞에
                                                                                                      // 추가
                .oauth2Login(oauth2 -> oauth2 // OAuth2 로그인 설정
                        .authorizationEndpoint(
                                auth -> auth.baseUri("/api/oauth2/authorization"))
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureUrl(failureUrl))
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
