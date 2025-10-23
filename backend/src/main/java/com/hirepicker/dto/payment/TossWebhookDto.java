package com.hirepicker.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// 가상계좌 입금 통보 등 토스 서버에서 보내는 웹훅 이벤트를 처리하기 위한 DTO
@JsonIgnoreProperties(ignoreUnknown = true)
public record TossWebhookDto(
    String eventType, // 이벤트 타입 (예: "VIRTUAL_ACCOUNT_DEPOSIT_COMPLETED")
    Data data       // 실제 데이터 객체
) {
    // 웹훅 데이터 내부 구조
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(
        String orderId, // 주문 ID
        String secret   // (선택) 웹훅 요청을 검증하기 위한 시크릿 키
    ) {}

    // 편의 메서드: 중첩된 orderId에 쉽게 접근
    public String getOrderId() {
        return (data != null) ? data.orderId() : null;
    }
}
