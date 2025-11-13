package com.hirepicker.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Refresh Token 엔티티
 * - Token Rotation 패턴 지원 (lastUsedAt 추적)
 * - 보안 개선: 사용 시각 기록으로 재사용 공격 탐지
 */
@Entity
@Table(name = "refresh_token")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_idx")
    private Long id;

    @Column(name = "refresh_token", nullable = false, length = 500)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt; // 마지막 사용 시각 (Token Rotation용)

    @Builder
    public RefreshToken(String token, UserType userType) {
        this.token = token;
        this.userType = userType;
        this.lastUsedAt = LocalDateTime.now(); // 생성 시각 기록
    }

    /**
     * 토큰 값 업데이트 (Token Rotation)
     * - 사용 시각도 함께 갱신
     */
    public void updateTokenValue(String token) {
        this.token = token;
        this.lastUsedAt = LocalDateTime.now();
    }

    /**
     * 마지막 사용 시각 갱신
     */
    public void updateLastUsedAt() {
        this.lastUsedAt = LocalDateTime.now();
    }
}