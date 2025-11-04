package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.payment.PaymentConfirmRequestDto;
import com.hirepicker.dto.payment.PaymentHistoryResponseDto;
import com.hirepicker.dto.payment.PaymentInitiateRequestDto;
import com.hirepicker.dto.payment.PaymentInitiateResponseDto;
import com.hirepicker.dto.payment.TossWebhookDto;
import com.hirepicker.service.TossPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "결제", description = "토스 페이먼츠 결제 관련 API")
@RestController @RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final TossPaymentService tossPaymentService;

    @Operation(summary = "결제 정보 생성 (주문서 생성)", description = "결제를 시작하기 위해 주문 정보를 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "주문 정보 생성 성공")
    })
    @PostMapping("/initiate")
    public ResponseEntity<PaymentInitiateResponseDto> initiatePayment(
            @RequestBody PaymentInitiateRequestDto requestDto,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("[API] /api/payment/initiate - 요청 수신");
        PaymentInitiateResponseDto response = tossPaymentService.initiatePayment(requestDto, userDetails);
        log.info("[API] /api/payment/initiate - 생성된 주문 정보: {}", response);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "결제 승인", description = "생성된 주문에 대해 결제를 승인합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "결제 승인 성공"),
        @ApiResponse(responseCode = "400", description = "결제 승인 실패")
    })
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(
            @RequestBody PaymentConfirmRequestDto confirmDto,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            Object tossPaymentResult = tossPaymentService.confirmPayment(confirmDto, userDetails);
            return ResponseEntity.ok(tossPaymentResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "가상계좌 웹훅", description = "토스 페이먼츠로부터 가상계좌 입금 완료 웹훅을 수신합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "웹훅 수신 성공")
    })
    @PostMapping("/webhook")
    public ResponseEntity<Void> tossWebhook(@RequestBody TossWebhookDto webhookDto) {
        tossPaymentService.handleWebhook(webhookDto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "결제 내역 조회", description = "현재 로그인한 사용자의 결제 내역을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "결제 내역 조회 성공")
    })
    @GetMapping("/history")
    public ResponseEntity<List<PaymentHistoryResponseDto>> getPaymentHistory(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {

        log.info("[API] /api/payment/history - 요청 수신. user: {}", userDetails.getUsername());
        List<PaymentHistoryResponseDto> paymentHistory = tossPaymentService.getPaymentHistory(userDetails);
        log.info("[API] /api/payment/history - 결제 내역 {}건 조회", paymentHistory.size());
        return ResponseEntity.ok(paymentHistory);
    }

    @GetMapping("/fail")
    public ResponseEntity<String> failPayment(@RequestParam(required = false) String code,
                                              @RequestParam(required = false) String message) {
        log.error("Payment failed. Code: {}, Message: {}", code, message);
        return ResponseEntity.status(500).body("결제 실패: " + (message != null ? message : "알 수 없는 오류"));
    }
}
