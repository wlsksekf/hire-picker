package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "refresh_token_storage") // 기존 refresh_token 테이블과 이름 충돌 방지를 위해 변경
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_storage_idx")
    private Long id;

    @Column(nullable = false, unique = true, length = 500) // 토큰 문자열, 유니크, 길이 제한
    private String token;

    @ManyToOne(fetch = FetchType.LAZY) // PersonalUser와의 ManyToOne 관계
    @JoinColumn(name = "p_user_idx", nullable = false) // 외래 키 컬럼 지정
    private PersonalUser personalUser;

    @Column(nullable = false) // 만료 시간
    private Instant expiryDate;

    @Column(nullable = false) // 토큰 활성 여부 (서버에서 강제 만료용)
    private boolean active;

    @Builder
    public RefreshToken(String token, PersonalUser personalUser, Instant expiryDate) {
        this.token = token;
        this.personalUser = personalUser;
        this.expiryDate = expiryDate;
        this.active = true; // 기본값은 활성
    }

    // 토큰 비활성화 메서드 (강제 만료용)
    public void deactivate() {
        this.active = false;
    }
}
