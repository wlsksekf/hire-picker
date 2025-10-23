package com.hirepicker.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.payment.*;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.payment.CompanyUserCredit;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.payment.PersonalUserCredit;
import com.hirepicker.entity.UserType;
import com.hirepicker.entity.payment.Payment;
import com.hirepicker.entity.payment.PaymentStatus;
import com.hirepicker.repository.payment.CompanyUserCreditRepository;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.payment.PersonalUserCreditRepository;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.payment.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service @RequiredArgsConstructor @Transactional
public class TossPaymentServiceImpl implements TossPaymentService {

    private final PaymentRepository paymentRepository;
    private final PersonalUserRepository personalUserRepository;
    private final CompanyUserRepository companyUserRepository;
    private final PersonalUserCreditRepository personalUserCreditRepository;
    private final CompanyUserCreditRepository companyUserCreditRepository;
    private final WebClient tossWebClient;
    private final ObjectMapper objectMapper; // JSON 처리를 위해 추가

    @Value("${toss.client-key}")
    private String clientKey;
    @Value("${toss.secret-key}")
    private String secretKey;

    // 1. 결제 생성 (서버에서 주문 생성)
    @Override
    public PaymentInitiateResponseDto initiatePayment(PaymentInitiateRequestDto requestDto, CustomUserDetails userDetails) {
        long amount;
        long credits;
        String orderName;

        switch (requestDto.packageId()) {
            case "PRODUCT_10K":
                amount = 10000L;
                credits = 10000L;
                orderName = "10,000 크레딧";
                break;
            case "PRODUCT_100K":
                amount = 70000L; // 할인
                credits = 100000L;
                orderName = "100,000 크레딧 (할인)";
                break;
            default:
                throw new IllegalArgumentException("Invalid package ID: " + requestDto.packageId());
        }

        String orderId = UUID.randomUUID().toString();
        String customerKey = userDetails.getUsername() + "_" + userDetails.getUserType();

        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .chargedCredits(credits)
                .status(PaymentStatus.PENDING)
                .build();

        // userDetails에서 ID와 타입을 직접 사용하여 유저를 찾음
        if (userDetails.getUserType() == UserType.PERSONAL) {
            PersonalUser user = personalUserRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new EntityNotFoundException("PersonalUser not found with id: " + userDetails.getId()));
            payment.setPersonalUser(user);
        } else {
            CompanyUser user = companyUserRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new EntityNotFoundException("CompanyUser not found with id: " + userDetails.getId()));
            payment.setCompanyUser(user);
        }
        
        paymentRepository.save(payment);

        return new PaymentInitiateResponseDto(clientKey, customerKey, orderId, orderName, amount);
    }

    // 2. 결제 승인
    @Override
    public Object confirmPayment(PaymentConfirmRequestDto confirmDto, CustomUserDetails userDetails) {
        Payment payment = paymentRepository.findByOrderIdAndStatus(confirmDto.orderId(), PaymentStatus.PENDING)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found or already processed"));

        if (!payment.getAmount().equals(confirmDto.amount())) {
            payment.setStatus(PaymentStatus.FAILED);
            throw new SecurityException("Payment amount manipulated");
        }

        String encodedSecretKey = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

        Map<String, Object> responseMap = tossWebClient.post()
                .uri("/v1/payments/confirm")
                .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedSecretKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(Map.of(
                        "paymentKey", confirmDto.paymentKey(),
                        "orderId", confirmDto.orderId(),
                        "amount", confirmDto.amount()
                ))
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(Map.class)
                                .flatMap(errorBody -> {
                                    log.error("Toss API Error: {}", errorBody);
                                    return Mono.error(new RuntimeException((String) errorBody.getOrDefault("message", "Toss API Error")));
                                })
                )
                .bodyToMono(Map.class)
                .block();

        String status = (String) responseMap.get("status");
        
        if ("DONE".equals(status)) {
            processPaymentSuccess(payment, responseMap);
        } else if ("WAITING_FOR_DEPOSIT".equals(status)) {
            processVirtualAccount(payment, responseMap);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        
        return responseMap;
    }
    
    // 3. (공통) 결제 성공 및 크레딧 지급 로직
    @Transactional
    public void processPaymentSuccess(Payment payment, Map<String, Object> responseMap) {
        payment.setStatus(PaymentStatus.DONE);
        payment.setPaymentKey((String) responseMap.get("paymentKey"));
        payment.setPaymentMethod((String) responseMap.get("method"));
        
        String approvedAtStr = (String) responseMap.get("approvedAt");
        if (approvedAtStr != null) {
            payment.setApprovedAt(LocalDateTime.parse(approvedAtStr, DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        }

        if (payment.getPersonalUser() != null) {
            PersonalUserCredit credit = personalUserCreditRepository.findById(payment.getPersonalUser().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Credit info not found for personal user"));
            credit.setBalance(credit.getBalance() + payment.getChargedCredits());
            credit.setUpdatedAt(LocalDateTime.now());
        } else if (payment.getCompanyUser() != null) {
            CompanyUserCredit credit = companyUserCreditRepository.findById(payment.getCompanyUser().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Credit info not found for company user"));
            credit.setBalance(credit.getBalance() + payment.getChargedCredits());
            credit.setUpdatedAt(LocalDateTime.now());
        }
    }

    // 4. (공통) 가상계좌 발급 처리
    @Transactional
    public void processVirtualAccount(Payment payment, Map<String, Object> responseMap) {
        payment.setStatus(PaymentStatus.PENDING_DEPOSIT);
        payment.setPaymentKey((String) responseMap.get("paymentKey"));
        payment.setPaymentMethod((String) responseMap.get("method"));
        
        Map<String, Object> vaInfo = (Map<String, Object>) responseMap.get("virtualAccount");
        try {
            payment.setVirtualAccountInfo(objectMapper.writeValueAsString(vaInfo));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize virtual account info", e);
            payment.setVirtualAccountInfo("Error serializing VA info");
        }
    }
    
    // 5. 가상계좌 웹훅 처리
    @Override @Transactional
    public void handleWebhook(TossWebhookDto webhookDto) {
        if (!"VIRTUAL_ACCOUNT_DEPOSIT_COMPLETED".equals(webhookDto.eventType())) {
            log.info("Received webhook for event type: {}, skipping.", webhookDto.eventType());
            return;
        }
        
        String orderId = webhookDto.getOrderId();
        if (orderId == null) {
            log.error("Webhook received without orderId");
            return;
        }
        
        log.info("Processing webhook for orderId: {}", orderId);
        Payment payment = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.PENDING_DEPOSIT)
                .orElseThrow(() -> new EntityNotFoundException("Webhook target payment not found or not in PENDING_DEPOSIT state for orderId: " + orderId));
        
        // Toss API에 해당 결제 건 재조회 (Toss에 직접 확인)
        String encodedSecretKey = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        Map<String, Object> responseMap = tossWebClient.get()
                .uri("/v1/payments/orders/" + orderId)
                .header(HttpHeaders.AUTHORIZATION, "Basic " + encodedSecretKey)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (responseMap != null && "DONE".equals(responseMap.get("status"))){
             processPaymentSuccess(payment, responseMap);
             log.info("Successfully processed webhook for orderId: {}", orderId);
        } else {
            log.warn("Webhook for orderId {} did not result in DONE status. Status was {}.", orderId, responseMap != null ? responseMap.get("status") : "null");
        }
    }
}