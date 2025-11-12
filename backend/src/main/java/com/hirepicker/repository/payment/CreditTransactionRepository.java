package com.hirepicker.repository.payment;

import com.hirepicker.entity.payment.CreditTransaction;
import com.hirepicker.entity.payment.CreditTransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    
    // 특정 기간 이후의 완료된 거래 조회
    @Query("SELECT ct FROM CreditTransaction ct WHERE ct.createdAt >= :since AND ct.status = :status ORDER BY ct.createdAt DESC")
    List<CreditTransaction> findCompletedTransactionsSince(@Param("since") LocalDateTime since, @Param("status") CreditTransactionStatus status);
    
    // 최근 N개의 완료된 거래 조회
    @Query("SELECT ct FROM CreditTransaction ct WHERE ct.status = :status ORDER BY ct.createdAt DESC")
    List<CreditTransaction> findRecentCompletedTransactions(@Param("status") CreditTransactionStatus status);
}


