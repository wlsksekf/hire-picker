package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    @Column(name = "purchase_idx")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_idx")
    private Resume resume; // 구매 대상 이력서

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx")
    private PersonalUser personalUser; // 구매한 개인회원 (선택)

    @Column(name = "resume_credits_used", nullable = false)
    private Long resumeCreditsUsed; // 사용한 크레딧 수

    @Column(name = "purchased_at", nullable = false)
    private LocalDate purchasedAt; // 구매 일자

    @PrePersist
    protected void onPersist() {
        if (purchasedAt == null) {
            purchasedAt = LocalDate.now();
        }
    }

    @Builder
    public ResumePurchase(Long id, Resume resume, PersonalUser personalUser,
                          Long resumeCreditsUsed, LocalDate purchasedAt) {
        this.id = id;
        this.resume = resume;
        this.personalUser = personalUser;
        this.resumeCreditsUsed = resumeCreditsUsed;
        this.purchasedAt = purchasedAt;
    }
}

