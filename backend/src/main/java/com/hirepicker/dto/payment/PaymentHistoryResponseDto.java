package com.hirepicker.dto.payment;

import com.hirepicker.entity.payment.Payment;
import com.hirepicker.entity.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryResponseDto {
    private Long paymentIdx;
    private String orderId;
    private Long amount;
    private Long chargedCredits;
    private String paymentMethod;
    private PaymentStatus status;
    private LocalDateTime approvedAt; // Payment 엔티티에 approvedAt 필드가 주석 처리되어 있었지만, 필요하다면 추가

    // Payment 엔티티로부터 DTO를 생성하는 생성자
    public PaymentHistoryResponseDto(Payment payment) {
        this.paymentIdx = payment.getId();
        this.orderId = payment.getOrderId();
        this.amount = payment.getAmount();
        this.chargedCredits = payment.getChargedCredits();
        this.paymentMethod = payment.getPaymentMethod();
        this.status = payment.getStatus();
        // payment.getApprovedAt()이 null일 수 있으므로 null 체크 필요
        // this.approvedAt = payment.getApprovedAt();
        // 현재 Payment 엔티티에 approvedAt 필드가 주석 처리되어 있으므로, 필요하다면 엔티티에 추가 후 사용
        this.approvedAt = null; // 임시로 null 처리
    }
}
