package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 광고 공고 엔티티
 * 회사회원이 10000 크레딧을 지불하고 등록하는 광고 공고
 */
@Entity
@Table(name = "ad_posting")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ad_posting_id")
    private Long adPostingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_user_id", nullable = false)
    private CompanyUser companyUser; // 광고를 등록한 회사회원

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posting_idx", nullable = false)
    private JobPosting jobPosting; // 광고로 등록할 채용공고 (기존 공고)

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate; // 광고 시작 날짜

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate; // 광고 종료 날짜

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AdStatus status = AdStatus.PENDING; // 광고 상태 (대기, 활성, 종료, 거절)

    @Column(name = "view_count")
    @Builder.Default
    private Long viewCount = 0L; // 조회수

    @Column(name = "click_count")
    @Builder.Default
    private Long clickCount = 0L; // 클릭수

    @Column(name = "credit_amount", nullable = false)
    @Builder.Default
    private Integer creditAmount = 10000; // 사용한 크레딧 (기본 10000)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // 생성 날짜

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정 날짜

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 광고 상태 변경
     */
    public void updateStatus(AdStatus status) {
        this.status = status;
    }

    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * 클릭수 증가
     */
    public void incrementClickCount() {
        this.clickCount++;
    }

    /**
     * 광고 종료일 수정
     */
    public void updateEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    /**
     * 광고 상태 Enum
     */
    public enum AdStatus {
        PENDING,  // 대기 중 (관리자 승인 대기)
        ACTIVE,   // 활성 (광고 노출 중)
        EXPIRED,  // 종료됨 (기간 만료)
        REJECTED  // 거절됨 (관리자가 거절)
    }
}

