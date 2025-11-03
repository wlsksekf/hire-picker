package com.hirepicker.config.security;

import com.hirepicker.exception.SocialAccountNeedsPasswordException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component // Spring의 컴포넌트로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
@Slf4j
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userDetailsService;
    private final @Lazy PasswordEncoder passwordEncoder; // 비밀번호 인코더 (순환 참조 방지를 위해 @Lazy 사용)

    // 인증 로직을 수행하는 메서드
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = (String) authentication.getCredentials();
        log.info("[Auth] CustomAuthenticationProvider.authenticate 호출. 사용자: {}", username);

        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);
        log.info("[Auth] UserDetailsService가 사용자 정보를 성공적으로 로드했습니다. 타입: {}", userDetails.getUserType());

        // 개인 회원인 경우에만 소셜 로그인 여부 체크
        if (userDetails.getUserType() == com.hirepicker.entity.UserType.PERSONAL) {
            if (userDetails.getPassword() == null) {
                log.warn("[Auth] 소셜 로그인 계정으로 로컬 로그인을 시도했습니다: {}", username);
                throw new SocialAccountNeedsPasswordException("소셜 로그인으로 가입된 계정입니다. 비밀번호를 설정해야 로컬 로그인이 가능합니다.");
            }
        }

        // 비밀번호 검증
        log.info("[Auth] 비밀번호 검증을 시작합니다...");
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            log.warn("[Auth] 비밀번호가 일치하지 않습니다. 사용자: {}", username);
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }
        log.info("[Auth] 비밀번호 검증 성공. 사용자: {}", username);

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()); // 인증 성공 시 Authentication 객체 반환
    }

    // 이 AuthenticationProvider가 지원하는 Authentication 타입을 지정
    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}