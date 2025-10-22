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
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PersonalUserRepository personalUserRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 1. 사용자 조회
        String username = authentication.getName();
        PersonalUser personalUser = personalUserRepository.findByEmail(username)
                .orElseThrow(() -> new IOException("User not found after OAuth2 login: " + username));

        // 2. 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);

        // 3. 리프레시 토큰 생성 또는 업데이트
        if (personalUser.getRefreshToken() == null) {
            // [시나리오 A: 최초 소셜 로그인]
            RefreshToken refreshToken = RefreshToken.builder()
                    .token(newRefreshTokenValue)
                    .userType(UserType.PERSONAL)
                    .build();
            RefreshToken savedToken = refreshTokenRepository.save(refreshToken);

            personalUser.setRefreshToken(savedToken);
            personalUserRepository.save(personalUser);
        } else {
            // [시나리오 B: 재-로그인]
            RefreshToken existingToken = personalUser.getRefreshToken();
            existingToken.updateTokenValue(newRefreshTokenValue);
            refreshTokenRepository.save(existingToken);
        }

        // 4. 쿠키에 토큰 저장 및 리다이렉트
        addTokensToCookie(response, accessToken, newRefreshTokenValue);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth/redirect")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private void addTokensToCookie(HttpServletResponse response, String accessToken, String refreshToken) {
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge((int) (jwtTokenProvider.getAccessTokenValidityInMilliseconds() / 1000));
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge((int) (jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000));
        response.addCookie(refreshTokenCookie);
    }
}
