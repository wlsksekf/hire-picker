package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "personal_user")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PersonalUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "p_user_idx")
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    private String password; // 소셜 로그인의 경우 null

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "adress") // DB 스키마에 정의된 오타(adress)를 그대로 사용
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(name = "reg_date")
    private LocalDate regDate;

    @Column(name = "mod_date")
    private LocalDate modDate;

    @Column(name = "is_cancel", nullable = false)
    private boolean isCancel;

    @Builder
    public PersonalUser(String email, String password, String nickname, String name, Gender gender, String phoneNumber, String address, Platform platform) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.name = name;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.platform = platform;
        this.regDate = LocalDate.now();
        this.isCancel = false;
    }
    
    // Setter for password (비밀번호 설정/변경 시 사용)
    public void setPassword(String password) {
        this.password = password;
    }
}
