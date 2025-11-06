package com.hirepicker.entity;

import com.hirepicker.entity.payment.PersonalUserCredit;
import com.hirepicker.entity.payment.Payment;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter; // Setter 임포트 추가

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity // JPA 엔티티임을 선언
@Table(name = "personal_user") // "personal_user" 테이블과 매핑
@Getter // 모든 필드에 대한 Getter 자동 생성
@Setter // 모든 필드에 대한 Setter 자동 생성 (추가)
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자 자동 생성 (접근 수준: protected)
public class PersonalUser {

    @Id // 기본 키 필드
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본 키 값 자동 생성 (DB에 위임)
    @Column(name = "p_user_idx") // "p_user_idx" 컬럼과 매핑
    private Long id;

    @Column(unique = true, nullable = false) // 유니크하고 null이 될 수 없는 컬럼
    private String email;

    @Column
    private String password; // 소셜 로그인의 경우 null일 수 있음

    @Column(nullable = false, unique = true) // null이 될 수 없고 유니크한 컬럼
    private String nickname;

    @Column(nullable = false) // null이 될 수 없는 컬럼
    private String name;

    @Enumerated(EnumType.STRING) // Enum 타입을 문자열로 저장
    @Column(nullable = true) // null이 될 수 있는 컬럼으로 변경
    private Gender gender;

    @Column(name = "phone_number") // "phone_number" 컬럼과 매핑
    private String phoneNumber;

    @Column(name = "address") // "address" 컬럼과 매핑
    private String address;

    @Column(name = "birth_date") // 생년월일 컬럼 매핑
    private LocalDate birthDate; // YYYY-MM-DD

    @Column(nullable = false) // null이 될 수 없는 컬럼
    private String platform; // Platform enum 대신 String으로 변경

    @Column(name = "reg_date") // "reg_date" 컬럼과 매핑
    private LocalDate regDate;

    @Column(name = "mod_date") // "mod_date" 컬럼과 매핑
    private LocalDate modDate;

    @Column(name = "is_cancel", nullable = false) // null이 될 수 없는 컬럼
    private boolean isCancel;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refresh_idx", nullable = true)
    private RefreshToken refreshToken;

    // 개인 크레딧 정보와 1:1 매핑
    @OneToOne(mappedBy = "personalUser", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PersonalUserCredit credit;

    // 개인 결제 내역과 1:N 매핑
    @OneToMany(mappedBy = "personalUser")
    private List<Payment> payments = new ArrayList<>();

    @Builder // 빌더 패턴을 사용하여 객체 생성
    public PersonalUser(String email, String password, String nickname, String name, Gender gender, String phoneNumber, String address, String platform) { // refreshIdx 파라미터 제거
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.name = name;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.platform = platform;
        this.regDate = LocalDate.now(); // 등록일은 현재 날짜로 설정
        this.isCancel = false; // 기본값은 false
    }

    // 비밀번호 설정/변경 시 사용
    public void setPassword(String password) {
        this.password = password;
    }

    // 닉네임 변경 시 사용
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    // 로그인 로직에서 사용할 setter
    public void setRefreshToken(RefreshToken refreshToken) {
        this.refreshToken = refreshToken;
    }

    // 로그인 로직에서 사용할 getter
    public Long getRefreshIdx() {
        return (this.refreshToken != null) ? this.refreshToken.getId() : null;
    }
}
