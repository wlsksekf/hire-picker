package com.hirepicker.service;

import com.hirepicker.config.jwt.JwtTokenProvider;
import com.hirepicker.dto.LoginRequest;
import com.hirepicker.dto.LoginResponse;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.RefreshToken;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PersonalUserRepository personalUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        try {
            // 1. 사용자 인증
            log.info("Step 1: Authenticating user...");
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("Step 1: Authentication successful.");

            PersonalUser user = personalUserRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));
            log.info("User found with ID: {}", user.getId());

            // 2. 토큰 생성
            log.info("Step 2: Creating tokens...");
            String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);
            String accessToken = jwtTokenProvider.createAccessToken(authentication);
            log.info("Step 2: Tokens created successfully.");

            // 3. 유저의 토큰 존재 여부 확인
            log.info("Step 3: Checking for existing refresh token...");
            if (user.getRefreshToken() == null) {
                log.info("Scenario A: First-time login for user.");
                // [시나리오 A: 최초 로그인]

                // 3-A. 새 RefreshToken 엔티티 생성 (UserType.PERSONAL 주입)
                log.info("Creating new RefreshToken entity...");
                RefreshToken refreshToken = RefreshToken.builder()
                        .token(newRefreshTokenValue)
                        .userType(UserType.PERSONAL)
                        .build();
                RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
                log.info("New RefreshToken saved with ID: {}", savedToken.getId());

                // 4-A. 유저 엔티티에 새 토큰 객체 주입 (UPDATE User)
                log.info("Updating user with new refresh token reference...");
                user.setRefreshToken(savedToken);
                personalUserRepository.save(user);
                log.info("User updated successfully.");

            } else {
                log.info("Scenario B: Re-login for user.");
                // [시나리오 B: 재로그인]

                // 3-B. 기존 토큰을 찾음
                RefreshToken existingToken = user.getRefreshToken();
                log.info("Found existing refresh token with ID: {}", existingToken.getId());

                // 4-B. 기존 토큰의 "값"만 덮어쓰기 (UPDATE Token)
                log.info("Updating existing refresh token value...");
                existingToken.updateTokenValue(newRefreshTokenValue);
                refreshTokenRepository.save(existingToken);
                log.info("Existing refresh token updated successfully.");
            }

            // 5. 액세스 토큰과 리프레시 토큰 반환
            log.info("Step 5: Returning tokens.");
            return new LoginResponse(accessToken, newRefreshTokenValue);

        } catch (Throwable t) {
            log.error("!!! UNCAUGHT EXCEPTION IN LOGIN SERVICE !!!", t);
            // 예외를 다시 던져서 @ControllerAdvice 또는 Spring 기본 예외 처리가 응답을 만들도록 함
            throw t;
        }
    }
}
