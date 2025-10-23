package com.hirepicker.repository.payment;

import com.hirepicker.entity.payment.Payment;
import com.hirepicker.entity.payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// 결제(Payment) 엔티티를 위한 Spring Data JPA 리포지토리
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // 주문 ID로 결제 정보를 조회
    Optional<Payment> findByOrderId(String orderId);
    
    // 주문 ID와 결제 상태로 결제 정보를 조회
    Optional<Payment> findByOrderIdAndStatus(String orderId, PaymentStatus status);
}
