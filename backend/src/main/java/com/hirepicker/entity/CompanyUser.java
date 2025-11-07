package com.hirepicker.entity;

import com.hirepicker.entity.payment.CompanyUserCredit;
import com.hirepicker.entity.payment.Payment;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "company_user")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor // 빌더 사용을 위해 추가
@Builder // 빌더 어노테이션 추가
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

    // 회사 크레딧 정보와 1:1 매핑
    @OneToOne(mappedBy = "companyUser", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CompanyUserCredit credit;

    // 회사 결제 내역과 1:N 매핑
    @OneToMany(mappedBy = "companyUser")
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    public void setRefreshToken(RefreshToken refreshToken) {
        this.refreshToken = refreshToken;
    }

    // 인증 파일 경로 (S3 URL, verification_file 컬럼)
    @Column(name = "verification_file", length = 500)
    private String verificationFile;

    // 승인 상태 (is_approved 컬럼)
    // 가능한 값: "PENDING", "APPROVED", "REJECTED"
    @Column(name = "is_approved", length = 20)
    @Builder.Default
    private String isApproved = ApprovalStatus.PENDING; // 기본값: 승인 대기
}
