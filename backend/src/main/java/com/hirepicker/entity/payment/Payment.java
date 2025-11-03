package com.hirepicker.entity.payment;

import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.PersonalUser;
import jakarta.persistence.*;
import lombok.*;

// 결제 정보를 저장하는 엔티티
@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Table(name = "payment")
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_idx")
    private Long id; // 결제 고유 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx")
    private PersonalUser personalUser; // 개인 회원

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "c_user_idx")
    private CompanyUser companyUser; // 기업 회원

    @Column(name = "order_id", unique = true, nullable = false)
    private String orderId; // 주문 ID

    @Column(name = "payment_key")
    private String paymentKey; // 결제 키

    @Column(name = "amount", nullable = false)
    private Long amount; // 결제 금액

    @Column(name = "charged_credits", nullable = false)
    private Long chargedCredits; // 충전된 크레딧

    @Column(name = "payment_method")
    private String paymentMethod; // 결제 수단

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status; // 결제 상태

    // @Column(name = "approved_at")
    // private LocalDateTime approvedAt; // 결제 승인 시각 - DB 스키마에 존재하지 않을 가능성 높아 주석 처리

    // @CreationTimestamp @Column(name = "created_at", updatable = false, nullable = false)
    // private LocalDateTime createdAt; // 생성 시각 - DB 스키마에 존재하지 않아 주석 처리
    
    // 가상계좌 정보 (JSON 또는 별도 컬럼)
    // @Column(name = "virtual_account_info", length = 512)
    // private String virtualAccountInfo; // 가상계좌 정보 - DB 스키마에 존재하지 않아 주석 처리
}
