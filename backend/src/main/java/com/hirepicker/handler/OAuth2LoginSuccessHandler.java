package com.hirepicker.handler;

import com.hirepicker.config.jwt.JwtTokenProvider;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.RefreshToken;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.RefreshTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PersonalUserRepository personalUserRepository;
    private final Environment env;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String provider = "GOOGLE"; // Google OAuth2

        Optional<PersonalUser> userOptional = personalUserRepository.findByEmail(email);
        PersonalUser personalUser;

        if (userOptional.isEmpty()) {
            // 최초 로그인: 사용자 정보 저장
            personalUser = PersonalUser.builder()
                    .email(email)
                    .name(name)
                    .platform(provider)
                    .nickname(name) // nickname은 name과 동일하게 설정
                    .gender(null) // gender는 null 허용
                    .phoneNumber(null)
                    .address(null)
                    .build();
            personalUserRepository.save(personalUser);
        } else {
            // 이미 가입된 사용자: 정보 업데이트 (필요시)
            personalUser = userOptional.get();
            // 예: 이름이 변경되었을 경우 업데이트
            if (!personalUser.getName().equals(name)) {
                personalUser.setName(name);
                personalUserRepository.save(personalUser);
            }
        }

        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);

        // 리프레시 토큰 생성 또는 업데이트 로직
        RefreshToken refreshToken = personalUser.getRefreshToken();
        if (refreshToken == null) {
            refreshToken = RefreshToken.builder()
                    .token(newRefreshTokenValue)
                    .userType(UserType.PERSONAL)
                    .build();
            refreshTokenRepository.save(refreshToken);
            personalUser.setRefreshToken(refreshToken);
            personalUserRepository.save(personalUser);
        } else {
            refreshToken.updateTokenValue(newRefreshTokenValue);
            refreshTokenRepository.save(refreshToken);
        }

        // 토큰을 쿠키에 저장
        addTokensToCookie(response, accessToken, newRefreshTokenValue);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    // HttpOnly, SameSite, Secure 속성을 적용하여 쿠키를 추가하는 헬퍼 메서드
    private void addTokensToCookie(HttpServletResponse response, String accessToken, String refreshToken) {
        // 현재 활성 프로필을 확인하여 secure 속성 동적 설정
        boolean isProduction = Arrays.asList(env.getActiveProfiles()).contains("prod");

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(isProduction) // ★ 환경에 따라 동적으로 설정
                .path("/")
                .maxAge(jwtTokenProvider.getAccessTokenValidityInMilliseconds() / 1000)
                .sameSite("Strict") // CSRF 방어를 위해 Strict 설정
                .build();
        response.addHeader("Set-Cookie", accessTokenCookie.toString());

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(isProduction) // 환경에 따라 동적으로 설정
                .path("/")
                .maxAge(jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000)
                .sameSite("Strict") // CSRF 방어를 위해 Strict 설정
                .build();
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());
    }
}
