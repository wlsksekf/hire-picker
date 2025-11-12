package com.hirepicker.repository.payment;

import com.hirepicker.entity.payment.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
}


