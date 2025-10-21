package com.hirepicker.controller;

import lombok.RequiredArgsConstructor; // RequiredArgsConstructor 임포트 추가
import com.hirepicker.config.jwt.JwtTokenProvider; // JwtTokenProvider 임포트 추가
import com.hirepicker.entity.PersonalUser; // PersonalUser 임포트 추가
import com.hirepicker.entity.RefreshToken; // RefreshToken 임포트 추가
import com.hirepicker.repository.PersonalUserRepository; // PersonalUserRepository 임포트 추가
import com.hirepicker.repository.RefreshTokenRepository; // RefreshTokenRepository 임포트 추가

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant; // Instant 임포트 추가
import java.util.HashMap;
import java.util.List; // List 임포트 추가
import java.util.Map;
import java.util.Optional; // Optional 임포트 추가

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository; // RefreshTokenRepository 주입
    private final PersonalUserRepository personalUserRepository; // PersonalUserRepository 주입

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication); // 리프레시 토큰 생성

        // 리프레시 토큰을 DB에 저장 (재사용 가능하도록)
        String username = authentication.getName();
        Optional<PersonalUser> personalUserOptional = personalUserRepository.findByEmail(username); // PersonalUser의 email 필드가 username과 일치한다고 가정
        if (personalUserOptional.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
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
        refreshTokenRepository.save(newRefreshTokenEntity);


        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken); // 리프레시 토큰 추가

        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh") // 리프레시 토큰 갱신 엔드포인트
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> request) { // 요청 본문에서 리프레시 토큰 받음
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) { // 리프레시 토큰 유효성 검사
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Refresh Token"));
        }

        // DB에서 리프레시 토큰 조회
        Optional<RefreshToken> storedRefreshTokenOptional = refreshTokenRepository.findByToken(refreshToken);
        if (storedRefreshTokenOptional.isEmpty() || !storedRefreshTokenOptional.get().isActive() || storedRefreshTokenOptional.get().getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or Expired Refresh Token in DB"));
        }

        // 리프레시 토큰에서 인증 정보 추출
        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);

        // 새로운 액세스 토큰 생성
        String newAccessToken = jwtTokenProvider.createAccessToken(authentication);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", newAccessToken);
        tokens.put("refreshToken", refreshToken); // 기존 리프레시 토큰 재사용

        return ResponseEntity.ok(tokens);
    }
}
