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
        // 이메일은 CustomOAuth2UserService에서 PersonalUser에 저장했으므로,
        // 다시 PersonalUser를 조회하여 사용합니다.
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<PersonalUser> userOptional = personalUserRepository.findByEmail(email);
        PersonalUser personalUser;

        if (userOptional.isPresent()) {
            // 이미 가입된 유저라면, 기존 정보를 업데이트 (필요시)
            personalUser = userOptional.get();
            // 예: 이름이 변경되었을 경우 업데이트
            if (!personalUser.getName().equals(name)) {
                personalUser.setName(name);
                personalUserRepository.save(personalUser);
            }
        } else {
            // 이 부분은 CustomOAuth2UserService에서 이미 PersonalUser를 저장했기 때문에
            // 여기에 도달할 일이 거의 없어야 합니다.
            // CustomOAuth2UserService에서 platform 정보도 이미 저장했을 것입니다.
            // 만약을 대비하여 로직은 유지합니다.
            personalUser = PersonalUser.builder()
                    .email(email)
                    .name(name)
                    .platform("UNKNOWN") // 여기에 도달하면 platform 정보가 불확실하므로 UNKNOWN으로 설정
                    .nickname(name)
                    .gender(null)
                    .phoneNumber(null)
                    .address(null)
                    .build();
            personalUserRepository.save(personalUser);
            // 이 시점에서 다시 조회하여 정확한 platform 정보를 가져오는 것이 필요할 수 있습니다.
            userOptional = personalUserRepository.findByEmail(email);
            personalUser = userOptional.orElseThrow(() -> new IllegalStateException("Newly created user not found."));
        }

        // PersonalUser에서 plateform 정보를 가져와 사용합니다.
        String provider = personalUser.getPlatform(); 

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

        // 환경에 따라 리디렉션 URL 결정
        boolean isProduction = Arrays.asList(env.getActiveProfiles()).contains("prod");
        String baseUrl = isProduction ? "https://hirepicker.duckdns.org" : "http://localhost:3000";
        String targetUrl = UriComponentsBuilder.fromUriString(baseUrl + "/oauth2/redirect")
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
