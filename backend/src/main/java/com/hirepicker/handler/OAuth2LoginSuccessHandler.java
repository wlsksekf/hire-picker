package com.hirepicker.handler;

import com.hirepicker.config.jwt.JwtTokenProvider;
import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.RefreshToken;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.RefreshTokenRepository;
import com.hirepicker.service.CreditService;
import com.hirepicker.util.CookieUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PersonalUserRepository personalUserRepository;
    private final Environment env;
    private final CookieUtils cookieUtils; // 쿠키 유틸리티

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        String email = customUserDetails.getUsername();
        PersonalUser personalUser = personalUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found with email: " + email));

        boolean signupBonusGranted = customUserDetails.isSignupBonusGranted();

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

        // 토큰을 쿠키에 저장 (CookieUtils 사용)
        response.addHeader("Set-Cookie", cookieUtils.createAccessTokenCookie(accessToken).toString());
        response.addHeader("Set-Cookie", cookieUtils.createRefreshTokenCookie(newRefreshTokenValue).toString());

        // 환경에 따라 리디렉션 URL 결정
        boolean isProduction = Arrays.asList(env.getActiveProfiles()).contains("prod");
        String baseUrl = isProduction ? "https://hirepicker.duckdns.org" : "http://localhost:3000";
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl + "/oauth2/redirect");
        if (signupBonusGranted) {
            builder.queryParam("signupBonus", CreditService.SIGNUP_BONUS_AMOUNT);
        }
        String targetUrl = builder.build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
