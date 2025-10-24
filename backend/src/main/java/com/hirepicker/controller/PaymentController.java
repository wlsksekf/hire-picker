package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.payment.*;
import com.hirepicker.service.TossPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController @RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final TossPaymentService tossPaymentService;

    // 1. 결제 정보 생성 (주문서 생성)
    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponseDto> initiatePayment(
            @RequestBody PaymentInitiateRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        log.info("[API] /api/payment/initiate - 요청 수신");
        PaymentInitiateResponseDto response = tossPaymentService.initiatePayment(requestDto, userDetails);
        log.info("[API] /api/payment/initiate - 생성된 주문 정보: {}", response);
        return ResponseEntity.ok(response);
    }

    // 2. 결제 승인
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(
            @RequestBody PaymentConfirmRequestDto confirmDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            Object tossPaymentResult = tossPaymentService.confirmPayment(confirmDto, userDetails);
            return ResponseEntity.ok(tossPaymentResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // 3. 가상계좌 웹훅 (Toss 서버가 호출)
    @PostMapping("/webhook")
    public ResponseEntity<Void> tossWebhook(@RequestBody TossWebhookDto webhookDto) {
        tossPaymentService.handleWebhook(webhookDto);
        return ResponseEntity.ok().build();
    }
}
