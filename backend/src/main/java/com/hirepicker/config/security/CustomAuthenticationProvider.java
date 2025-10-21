package com.hirepicker.config.security;

import com.hirepicker.entity.PersonalUser;
import com.hirepicker.exception.SocialAccountNeedsPasswordException;
import lombok.RequiredArgsConstructor;
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
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userDetailsService; // 사용자 정보 서비스
    private final @Lazy PasswordEncoder passwordEncoder; // 비밀번호 인코더 (순환 참조 방지를 위해 @Lazy 사용)

    // 인증 로직을 수행하는 메서드
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName(); // 사용자 이름(이메일) 추출
        String password = (String) authentication.getCredentials(); // 비밀번호 추출

        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);
        PersonalUser personalUser = userDetails.getPersonalUser();

        // 소셜 가입 유저가 로컬 로그인을 시도하는 경우
        if (personalUser.getPassword() == null) {
            throw new SocialAccountNeedsPasswordException("소셜 로그인으로 가입된 계정입니다. 비밀번호를 설정해야 로컬 로그인이 가능합니다.");
        }

        // 일반 로컬 유저의 비밀번호 검증
        if (!passwordEncoder.matches(password, personalUser.getPassword())) {
            throw new BadCredentialsException("비밀번호가 일치하지 않습니다.");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()); // 인증 성공 시 Authentication 객체 반환
    }

    // 이 AuthenticationProvider가 지원하는 Authentication 타입을 지정
    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}