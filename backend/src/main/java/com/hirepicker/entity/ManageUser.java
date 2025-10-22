package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "manage_user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ManageUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "m_user_idx")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refresh_idx", nullable = true)
    private RefreshToken refreshToken;

    @Column(name = "id", nullable = false, length = 15)
    private String loginId;

    @Column(length = 100)
    private String password;

    @Column(length = 10)
    private String name;

    @Column(name = "phone_number", length = 16)
    private String phoneNumber;

    private Byte authority;

    public void setRefreshToken(RefreshToken refreshToken) {
        this.refreshToken = refreshToken;
    }
}
