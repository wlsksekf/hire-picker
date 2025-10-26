package com.hirepicker.repository.payment;

import com.hirepicker.entity.payment.CreditUsageHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditUsageHistoryRepository extends JpaRepository<CreditUsageHistory, Long> {
}
