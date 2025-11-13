package com.hirepicker.repository.payment;

import com.hirepicker.entity.payment.CreditTransaction;
import com.hirepicker.entity.payment.CreditTransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    
    // 특정 기간 이후의 완료된 거래 조회 (payment 함께 로드)
    @Query("SELECT ct FROM CreditTransaction ct LEFT JOIN FETCH ct.payment WHERE ct.createdAt >= :since AND ct.status = :status ORDER BY ct.createdAt DESC")
    List<CreditTransaction> findCompletedTransactionsSince(@Param("since") LocalDateTime since, @Param("status") CreditTransactionStatus status);
    
    // 최근 N개의 완료된 거래 조회 (payment 함께 로드)
    @Query("SELECT ct FROM CreditTransaction ct LEFT JOIN FETCH ct.payment WHERE ct.status = :status ORDER BY ct.createdAt DESC")
    List<CreditTransaction> findRecentCompletedTransactions(@Param("status") CreditTransactionStatus status);
    
    // 이력서 구매 여부 확인 (개인 사용자 기준)
    @Query("SELECT COUNT(ct) > 0 FROM CreditTransaction ct WHERE ct.personalUser.id = :userId AND ct.transactionType = 'RESUME_PURCHASE' AND ct.referenceType = 'RESUME' AND ct.referenceId = :resumeId AND ct.status = 'COMPLETED'")
    boolean existsByPersonalUserIdAndResumeId(@Param("userId") Long userId, @Param("resumeId") Long resumeId);
}


