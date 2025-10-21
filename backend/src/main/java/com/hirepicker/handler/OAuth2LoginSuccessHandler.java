package com.hirepicker.handler;

import com.hirepicker.config.jwt.JwtTokenProvider;
import com.hirepicker.entity.PersonalUser; // PersonalUser 임포트 추가
import com.hirepicker.entity.RefreshToken; // RefreshToken 임포트 추가
import com.hirepicker.repository.PersonalUserRepository; // PersonalUserRepository 임포트 추가
import com.hirepicker.repository.RefreshTokenRepository; // RefreshTokenRepository 임포트 추가
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie; // Cookie 임포트 추가
import org.springframework.stereotype.Component; // Component 임포트 추가
import org.springframework.security.core.Authentication; // Authentication 임포트 추가
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler; // SimpleUrlAuthenticationSuccessHandler 임포트 추가
import org.springframework.web.util.UriComponentsBuilder; // UriComponentsBuilder 임포트 추가

import java.io.IOException; // IOException 임포트 추가
import java.time.Instant; // Instant 임포트 추가
import java.util.List;
import java.util.Optional; // Optional 임포트 추가
@Component
// @RequiredArgsConstructor // RequiredArgsConstructor 제거
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider; // JWT 토큰 제공자
    private final RefreshTokenRepository refreshTokenRepository; // RefreshTokenRepository 주입
    private final PersonalUserRepository personalUserRepository; // PersonalUserRepository 주입

    // 생성자 주입 (RequiredArgsConstructor 대체)
    public OAuth2LoginSuccessHandler(JwtTokenProvider jwtTokenProvider, RefreshTokenRepository refreshTokenRepository, PersonalUserRepository personalUserRepository) {
        super(); // SimpleUrlAuthenticationSuccessHandler의 기본 생성자 호출
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.personalUserRepository = personalUserRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String accessToken = jwtTokenProvider.createAccessToken(authentication); // 액세스 토큰 생성
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication); // 리프레시 토큰 생성

        // 리프레시 토큰을 DB에 저장 (재사용 가능하도록)
        String username = authentication.getName();
        Optional<PersonalUser> personalUserOptional = personalUserRepository.findByEmail(username); // PersonalUser의 email 필드가 username과 일치한다고 가정
        if (personalUserOptional.isEmpty()) {
            // 에러 처리: 사용자를 찾을 수 없음
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "User not found after OAuth2 login");
            return;
        }
        PersonalUser personalUser = personalUserOptional.get();

        // 기존 리프레시 토큰이 있다면 비활성화 (새로운 토큰 발급 시 기존 토큰 무효화)
        List<RefreshToken> existingRefreshTokens = refreshTokenRepository.findAllByPersonalUserAndActiveTrue(personalUser);
        existingRefreshTokens.forEach(RefreshToken::deactivate); // 각 토큰을 비활성화
        refreshTokenRepository.saveAll(existingRefreshTokens); // 변경된 상태를 DB에 저장

        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .personalUser(personalUser)
                .expiryDate(jwtTokenProvider.getExpirationDateFromToken(refreshToken).toInstant())
                .build();

        // 리프레시 토큰이 이미 만료되었는지 확인 (Instant.now() 사용 예시)
        if (newRefreshTokenEntity.getExpiryDate().isBefore(Instant.now())) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Generated refresh token is already expired.");
            return;
        }
        refreshTokenRepository.save(newRefreshTokenEntity);

        // HttpOnly 쿠키에 액세스 토큰 저장
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true); // HTTPS 사용 시 필수
        accessTokenCookie.setPath("/"); // 모든 경로에서 접근 가능
        accessTokenCookie.setMaxAge((int) (jwtTokenProvider.getAccessTokenValidityInMilliseconds() / 1000)); // 액세스 토큰 유효 기간 설정
        response.addCookie(accessTokenCookie);

        // HttpOnly 쿠키에 리프레시 토큰 저장
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true); // HTTPS 사용 시 필수
        refreshTokenCookie.setPath("/"); // 모든 경로에서 접근 가능
        refreshTokenCookie.setMaxAge((int) (jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000)); // 리프레시 토큰 유효 기간 설정
        response.addCookie(refreshTokenCookie);

        // 프론트엔드로 리다이렉트할 URL 생성. (보안 강화를 위해 토큰을 쿼리 파라미터에서 제거함)
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth/redirect")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl); // 리다이렉트
    }
}