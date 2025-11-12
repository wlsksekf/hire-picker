package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 이력서 열람 구매 이력 엔티티
 */
@Entity
@Table(name = "resume_purchase")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ResumePurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_idx")
    private Resume resume; // 구매 대상 이력서

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_p_user_idx")
    private PersonalUser buyer; // 구매자

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id")
    private com.hirepicker.entity.payment.CreditTransaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ResumePurchaseStatus status;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onPersist() {
        if (createdAt == null) {
            createdAt = java.time.LocalDateTime.now();
        }
        if (status == null) {
            status = ResumePurchaseStatus.COMPLETED;
        }
    }

    @Builder
    public ResumePurchase(Long id, Resume resume, PersonalUser buyer,
                          com.hirepicker.entity.payment.CreditTransaction transaction,
                          ResumePurchaseStatus status, java.time.LocalDateTime createdAt) {
        this.id = id;
        this.resume = resume;
        this.buyer = buyer;
        this.transaction = transaction;
        this.status = status != null ? status : ResumePurchaseStatus.COMPLETED;
        this.createdAt = createdAt != null ? createdAt : java.time.LocalDateTime.now();
    }
}

