package com.hirepicker.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

// 토스페이먼츠 관련 비즈니스 로직을 정의하는 인터페이스
public interface TossPaymentService {
    // 결제 승인
    Map<String, Object> confirmPayment(HttpServletRequest request, String jsonBody) throws Exception;
    // 자동 결제
    Map<String, Object> confirmBilling(String jsonBody) throws Exception;
    // 빌링키 발급
    Map<String, Object> issueBillingKey(String jsonBody) throws Exception;
    // 브랜드페이 인증 콜백 처리
    Map<String, Object> callbackAuth(String customerKey, String code) throws Exception;
    // 브랜드페이 결제 승인
    Map<String, Object> confirmBrandpay(String jsonBody) throws Exception;
}
