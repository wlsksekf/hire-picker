package com.hirepicker.service;

import com.hirepicker.config.jwt.JwtTokenProvider;
import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.LoginRequest;
import com.hirepicker.dto.LoginResponse;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.RefreshToken;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.CompanyUserRepository;
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
    private final CompanyUserRepository companyUserRepository; // 기업 유저 리포지토리 주입
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());
        try {
            // 1. 사용자 인증
            log.info("Step 1: Authenticating user...");
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("Step 1: Authentication successful.");

            // 인증된 사용자 정보 가져오기
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UserType userType = userDetails.getUserType();
            Long userId = userDetails.getId();

            // 2. 토큰 생성
            log.info("Step 2: Creating tokens for user ID: {}, type: {}", userId, userType);
            String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);
            String accessToken = jwtTokenProvider.createAccessToken(authentication);
            log.info("Step 2: Tokens created successfully.");

            // 3. 리프레시 토큰 처리
            log.info("Step 3: Processing refresh token...");
            if (userType == UserType.PERSONAL) {
                PersonalUser user = personalUserRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Personal user not found with ID: " + userId));
                handleRefreshToken(user, newRefreshTokenValue, userType);
            } else {
                CompanyUser user = companyUserRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Company user not found with ID: " + userId));
                handleRefreshToken(user, newRefreshTokenValue, userType);
            }

            // 5. 액세스 토큰과 리프레시 토큰 반환
            log.info("Step 5: Returning tokens.");
            return new LoginResponse(accessToken, newRefreshTokenValue);

        } catch (Throwable t) {
            log.error("!!! UNCAUGHT EXCEPTION IN LOGIN SERVICE !!!", t);
            throw t;
        }
    }

    // 리프레시 토큰 처리 로직을 별도 메서드로 분리 (PersonalUser, CompanyUser 공용)
    private void handleRefreshToken(Object user, String newRefreshTokenValue, UserType userType) {
        RefreshToken refreshToken = null;
        boolean isNewUser = false;

        if (user instanceof PersonalUser pUser) {
            refreshToken = pUser.getRefreshToken();
            if (refreshToken == null) isNewUser = true;
        } else if (user instanceof CompanyUser cUser) {
            refreshToken = cUser.getRefreshToken();
            if (refreshToken == null) isNewUser = true;
        }

        if (isNewUser) {
            log.info("Scenario A: First-time login for user.");
            RefreshToken newRefreshToken = RefreshToken.builder()
                    .token(newRefreshTokenValue)
                    .userType(userType)
                    .build();
            RefreshToken savedToken = refreshTokenRepository.save(newRefreshToken);

            if (user instanceof PersonalUser pUser) {
                pUser.setRefreshToken(savedToken);
                personalUserRepository.save(pUser);
            } else if (user instanceof CompanyUser cUser) {
                cUser.setRefreshToken(savedToken);
                companyUserRepository.save(cUser);
            }
            log.info("New RefreshToken saved and user updated.");
        } else {
            log.info("Scenario B: Re-login for user.");
            refreshToken.updateTokenValue(newRefreshTokenValue);
            refreshTokenRepository.save(refreshToken);
            log.info("Existing refresh token updated.");
        }
    }
}
