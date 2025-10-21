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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PersonalUserRepository personalUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 1. 사용자 인증
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        PersonalUser user = personalUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        // 2. 토큰 생성
        String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);
        String accessToken = jwtTokenProvider.createAccessToken(authentication);

        // 3. 유저의 토큰 존재 여부 확인
        if (user.getRefreshToken() == null) {
            // [시나리오 A: 최초 로그인]

            // 3-A. 새 RefreshToken 엔티티 생성 (UserType.PERSONAL 주입)
            RefreshToken refreshToken = RefreshToken.builder()
                    .token(newRefreshTokenValue)
                    .userType(UserType.PERSONAL)
                    .build();
            RefreshToken savedToken = refreshTokenRepository.save(refreshToken);

            // 4-A. 유저 엔티티에 새 토큰 객체 주입 (UPDATE User)
            user.setRefreshToken(savedToken);
            personalUserRepository.save(user);

        } else {
            // [시나리오 B: 재로그인]

            // 3-B. 기존 토큰을 찾음
            RefreshToken existingToken = user.getRefreshToken();

            // 4-B. 기존 토큰의 "값"만 덮어쓰기 (UPDATE Token)
            existingToken.updateTokenValue(newRefreshTokenValue);
            refreshTokenRepository.save(existingToken);
        }

        // 5. 액세스 토큰과 리프레시 토큰 반환
        return new LoginResponse(accessToken, newRefreshTokenValue);
    }
}