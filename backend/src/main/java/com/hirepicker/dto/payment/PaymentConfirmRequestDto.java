package com.hirepicker.dto.payment;

// 결제 성공 후, 클라이언트가 백엔드에 결제 승인을 요청할 때 사용하는 DTO
public record PaymentConfirmRequestDto(
    String paymentKey, // 토스에서 발급한 결제 식별 키
    String orderId,    // 백엔드에서 생성했던 주문 ID
    Long amount        // 최종 결제 금액 (검증용)
) {}
