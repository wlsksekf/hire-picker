package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "company_user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CompanyUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "c_user_idx")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_idx", nullable = false)
    private Company company;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refresh_idx", nullable = true)
    private RefreshToken refreshToken;

    @Column(name = "id", nullable = false, length = 15)
    private String loginId;

    @Column(nullable = false, length = 300)
    private String password;

    @Column(nullable = false, length = 10)
    private String name;

    @Column(nullable = false, length = 50)
    private String email;

    @Column(name = "phone_number", length = 16)
    private String phoneNumber;

    @Column(name = "reg_date")
    private LocalDate regDate;

    @Column(name = "mod_date")
    private LocalDate modDate;

    @Column(name = "is_cancel")
    private boolean isCancel;

    public void setRefreshToken(RefreshToken refreshToken) {
        this.refreshToken = refreshToken;
    }
}
