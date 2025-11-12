package com.hirepicker.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자 페이지 결제 통계 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatisticsDto {
    // 요약 카드 데이터
    private SummaryCards summaryCards;
    
    // 월별 통계 (최근 6개월)
    private List<MonthlyStat> monthlyStats;
    
    // 결제 타입별 통계
    private List<TypeStat> typeStats;
    
    // 최근 결제 활동
    private List<RecentActivity> recentActivities;
    
    // KPI 지표
    private KpiMetrics kpiMetrics;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryCards {
        private Long totalTransactions;      // 총 거래 건수
        private Long totalRevenue;          // 총 수익 (크레딧 기준)
        private Long totalRefunds;           // 총 환불 건수
        private Double refundRate;           // 환불률 (%)
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStat {
        private String month;                // "2025-01" 형식
        private String monthLabel;           // "1월" 형식
        private Long totalAmount;            // 해당 월 총 거래액
        private Long refundAmount;           // 해당 월 환불액
        private Long transactionCount;       // 거래 건수
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeStat {
        private String type;                 // "AI_RESUME_GENERATION", "RESUME_PURCHASE" 등
        private String typeLabel;            // "AI 이력서 생성", "이력서 거래소" 등
        private Long totalAmount;            // 총 거래액
        private Long transactionCount;       // 거래 건수
        private Double percentage;           // 전체 대비 비율 (%)
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private Long transactionId;
        private String type;                 // 거래 타입
        private String typeLabel;            // 거래 타입 라벨
        private String userName;             // 사용자 이름
        private Long amount;                 // 거래 금액 (크레딧)
        private LocalDateTime createdAt;     // 거래 시간
        private String timeAgo;              // "3분 전" 형식
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiMetrics {
        private Double averageTransactionAmount;  // 평균 거래 단가
        private Double repeatPurchaseRate;        // 재구매율 (%)
        private Double conversionRate;            // 전환율 (%)
    }
}


