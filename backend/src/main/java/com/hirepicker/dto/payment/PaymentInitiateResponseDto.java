package com.hirepicker.dto.payment;

import lombok.Value;

// 서버가 생성한 주문 정보를 담아 결제 위젯에 전달
@Value
public class PaymentInitiateResponseDto {
    String clientKey;      // 토스페이먼츠 클라이언트 키
    String customerKey;    // 유저 식별 키 (ANONYMOUS 또는 유저 고유키)
    String orderId;        // 가맹점에서 생성한 고유 주문 ID
    String orderName;      // 주문명 (예: "10,000 크레딧")
    Long amount;           // 결제 금액
}
