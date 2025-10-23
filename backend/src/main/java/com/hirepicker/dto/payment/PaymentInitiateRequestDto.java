package com.hirepicker.dto.payment;

// 클라이언트가 요청할 상품 ID ("PRODUCT_10K", "PRODUCT_100K" 등)
public record PaymentInitiateRequestDto(String packageId) {}
