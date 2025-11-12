package com.hirepicker.service;

import com.hirepicker.dto.admin.PaymentStatisticsDto;
import com.hirepicker.entity.payment.CreditTransaction;
import com.hirepicker.entity.payment.CreditTransactionStatus;
import com.hirepicker.repository.payment.CreditTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 관리자 페이지 결제 통계 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPaymentService {

    private final CreditTransactionRepository creditTransactionRepository;

    // 거래 타입별 한글 라벨 매핑
    private static final Map<String, String> TRANSACTION_TYPE_LABELS = Map.of(
            "AI_RESUME_GENERATION", "AI 이력서 생성",
            "RESUME_PURCHASE", "이력서 거래소",
            "JOB_POSTING_AD", "광고 채용공고",
            "POST_AD", "광고 게시글",
            "CREDIT_TOPUP", "크레딧 충전",
            "SIGNUP_BONUS", "가입 보너스"
    );

    /**
     * 결제 통계 조회
     */
    public PaymentStatisticsDto getPaymentStatistics() {
        // 최근 6개월 데이터 조회
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<CreditTransaction> transactions = creditTransactionRepository
                .findCompletedTransactionsSince(sixMonthsAgo, CreditTransactionStatus.COMPLETED);

        // 요약 카드 데이터
        PaymentStatisticsDto.SummaryCards summaryCards = buildSummaryCards(transactions);

        // 월별 통계
        List<PaymentStatisticsDto.MonthlyStat> monthlyStats = buildMonthlyStats(transactions);

        // 타입별 통계
        List<PaymentStatisticsDto.TypeStat> typeStats = buildTypeStats(transactions);

        // 최근 활동
        List<PaymentStatisticsDto.RecentActivity> recentActivities = buildRecentActivities();

        // KPI 지표
        PaymentStatisticsDto.KpiMetrics kpiMetrics = buildKpiMetrics(transactions);

        return PaymentStatisticsDto.builder()
                .summaryCards(summaryCards)
                .monthlyStats(monthlyStats)
                .typeStats(typeStats)
                .recentActivities(recentActivities)
                .kpiMetrics(kpiMetrics)
                .build();
    }

    private PaymentStatisticsDto.SummaryCards buildSummaryCards(List<CreditTransaction> transactions) {
        // 양수 거래만 수익으로 계산 (크레딧 충전 등)
        long totalRevenue = transactions.stream()
                .filter(t -> t.getAmount() != null && t.getAmount() > 0)
                .mapToLong(CreditTransaction::getAmount)
                .sum();
        
        // 음수 거래는 크레딧 사용 (차감)이므로 수익에서 제외
        long totalUsage = Math.abs(transactions.stream()
                .filter(t -> t.getAmount() != null && t.getAmount() < 0)
                .mapToLong(CreditTransaction::getAmount)
                .sum());
        
        // 총 거래 건수 (충전 + 사용)
        long totalTransactions = transactions.size();
        
        // 환불 로직이 현재 구현되지 않았으므로 0으로 설정
        long refundCount = 0L;
        double refundRate = 0.0;

        return PaymentStatisticsDto.SummaryCards.builder()
                .totalTransactions(totalTransactions)
                .totalRevenue(totalRevenue)
                .totalRefunds(refundCount)
                .refundRate(refundRate)
                .build();
    }

    private List<PaymentStatisticsDto.MonthlyStat> buildMonthlyStats(List<CreditTransaction> transactions) {
        Map<String, List<CreditTransaction>> byMonth = transactions.stream()
                .collect(Collectors.groupingBy(t -> {
                    LocalDateTime date = t.getCreatedAt();
                    return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                }));

        List<PaymentStatisticsDto.MonthlyStat> stats = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i);
            String monthKey = monthStart.getYear() + "-" + String.format("%02d", monthStart.getMonthValue());
            String monthLabel = monthStart.getMonthValue() + "월";
            
            List<CreditTransaction> monthTransactions = byMonth.getOrDefault(monthKey, Collections.emptyList());
            
            // 양수 거래만 수익으로 계산 (크레딧 충전)
            long totalAmount = monthTransactions.stream()
                    .filter(t -> t.getAmount() != null && t.getAmount() > 0)
                    .mapToLong(CreditTransaction::getAmount)
                    .sum();
            
            // 환불 로직이 현재 구현되지 않았으므로 0으로 설정
            long refundAmount = 0L;

            stats.add(PaymentStatisticsDto.MonthlyStat.builder()
                    .month(monthKey)
                    .monthLabel(monthLabel)
                    .totalAmount(totalAmount)
                    .refundAmount(refundAmount)
                    .transactionCount((long) monthTransactions.size())
                    .build());
        }

        return stats;
    }

    private List<PaymentStatisticsDto.TypeStat> buildTypeStats(List<CreditTransaction> transactions) {
        Map<String, List<CreditTransaction>> byType = transactions.stream()
                .filter(t -> t.getTransactionType() != null)
                .collect(Collectors.groupingBy(CreditTransaction::getTransactionType));

        long totalRevenue = transactions.stream()
                .filter(t -> t.getAmount() != null && t.getAmount() > 0)
                .mapToLong(CreditTransaction::getAmount)
                .sum();

        List<PaymentStatisticsDto.TypeStat> stats = new ArrayList<>();
        for (Map.Entry<String, List<CreditTransaction>> entry : byType.entrySet()) {
            String type = entry.getKey();
            List<CreditTransaction> typeTransactions = entry.getValue();
            
            long typeAmount = typeTransactions.stream()
                    .filter(t -> t.getAmount() != null && t.getAmount() > 0)
                    .mapToLong(CreditTransaction::getAmount)
                    .sum();
            
            double percentage = totalRevenue > 0 
                    ? (double) typeAmount / totalRevenue * 100.0 
                    : 0.0;

            stats.add(PaymentStatisticsDto.TypeStat.builder()
                    .type(type)
                    .typeLabel(TRANSACTION_TYPE_LABELS.getOrDefault(type, type))
                    .totalAmount(typeAmount)
                    .transactionCount((long) typeTransactions.size())
                    .percentage(Math.round(percentage * 10.0) / 10.0)
                    .build());
        }

        // 금액 기준 내림차순 정렬
        stats.sort((a, b) -> Long.compare(b.getTotalAmount(), a.getTotalAmount()));
        
        return stats;
    }

    private List<PaymentStatisticsDto.RecentActivity> buildRecentActivities() {
        List<CreditTransaction> recent = creditTransactionRepository
                .findRecentCompletedTransactions(CreditTransactionStatus.COMPLETED)
                .stream()
                .filter(t -> t.getCreatedAt() != null)
                .limit(10)
                .collect(Collectors.toList());

        return recent.stream()
                .map(t -> {
                    String userName = "사용자";
                    if (t.getPersonalUser() != null) {
                        userName = t.getPersonalUser().getName() != null 
                                ? t.getPersonalUser().getName() 
                                : t.getPersonalUser().getEmail();
                    } else if (t.getCompanyUser() != null) {
                        userName = t.getCompanyUser().getName() != null 
                                ? t.getCompanyUser().getName() 
                                : t.getCompanyUser().getEmail();
                    }

                    String timeAgo = formatTimeAgo(t.getCreatedAt());

                    return PaymentStatisticsDto.RecentActivity.builder()
                            .transactionId(t.getId())
                            .type(t.getTransactionType())
                            .typeLabel(TRANSACTION_TYPE_LABELS.getOrDefault(
                                    t.getTransactionType(), 
                                    t.getTransactionType()))
                            .userName(userName)
                            .amount(t.getAmount() != null ? Math.abs(t.getAmount()) : 0L)
                            .createdAt(t.getCreatedAt())
                            .timeAgo(timeAgo)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private PaymentStatisticsDto.KpiMetrics buildKpiMetrics(List<CreditTransaction> transactions) {
        if (transactions.isEmpty()) {
            return PaymentStatisticsDto.KpiMetrics.builder()
                    .averageTransactionAmount(0.0)
                    .repeatPurchaseRate(0.0)
                    .conversionRate(0.0)
                    .build();
        }

        // 평균 거래 단가
        double avgAmount = transactions.stream()
                .filter(t -> t.getAmount() != null && t.getAmount() > 0)
                .mapToLong(CreditTransaction::getAmount)
                .average()
                .orElse(0.0);

        // 재구매율 계산 (같은 사용자가 2회 이상 거래한 비율)
        Set<Long> uniqueUsers = new HashSet<>();
        Set<Long> repeatUsers = new HashSet<>();
        Map<Long, Integer> userTransactionCount = new HashMap<>();
        
        for (CreditTransaction t : transactions) {
            Long userId = null;
            if (t.getPersonalUser() != null) {
                userId = t.getPersonalUser().getId();
            } else if (t.getCompanyUser() != null) {
                userId = t.getCompanyUser().getId() + 1000000L; // 기업회원과 개인회원 구분
            }
            
            if (userId != null) {
                uniqueUsers.add(userId);
                int count = userTransactionCount.getOrDefault(userId, 0) + 1;
                userTransactionCount.put(userId, count);
                if (count >= 2) {
                    repeatUsers.add(userId);
                }
            }
        }
        
        double repeatRate = uniqueUsers.isEmpty() 
                ? 0.0 
                : (double) repeatUsers.size() / uniqueUsers.size() * 100.0;

        return PaymentStatisticsDto.KpiMetrics.builder()
                .averageTransactionAmount(Math.round(avgAmount * 10.0) / 10.0)
                .repeatPurchaseRate(Math.round(repeatRate * 10.0) / 10.0)
                .conversionRate(27.0) // 임시값 (실제 계산 로직 필요)
                .build();
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "알 수 없음";
        
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();
        
        if (minutes < 1) return "방금 전";
        if (minutes < 60) return minutes + "분 전";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + "시간 전";
        
        long days = hours / 24;
        if (days < 7) return days + "일 전";
        
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
}


