package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.payment.*;
import java.util.List;

// 토스페이먼츠 결제 로직을 처리하는 서비스 인터페이스
public interface TossPaymentService {

    // 결제 정보 생성 (주문서 생성)
    PaymentInitiateResponseDto initiatePayment(PaymentInitiateRequestDto requestDto, CustomUserDetails userDetails);

    // 결제 승인
    Object confirmPayment(PaymentConfirmRequestDto confirmDto, CustomUserDetails userDetails);

    // 가상계좌 입금 처리 웹훅
    void handleWebhook(TossWebhookDto webhookDto);

    // 결제 내역 조회
    List<PaymentHistoryResponseDto> getPaymentHistory(CustomUserDetails userDetails);
}
