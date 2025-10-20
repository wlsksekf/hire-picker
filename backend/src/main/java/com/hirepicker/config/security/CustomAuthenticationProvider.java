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

@Component
@RequiredArgsConstructor
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userDetailsService;
    private final @Lazy PasswordEncoder passwordEncoder; // @Lazy 어노테이션 추가

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = (String) authentication.getCredentials();

        CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);
        PersonalUser personalUser = userDetails.getPersonalUser();

        // C 시나리오의 핵심 로직: 소셜 가입 유저가 로컬 로그인을 시도하는 경우
        if (personalUser.getPassword() == null) {
            throw new SocialAccountNeedsPasswordException("This account signed up via social login. Password setup is required for local login.");
        }

        // 일반 로컬 유저의 비밀번호 검증
        if (!passwordEncoder.matches(password, personalUser.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
