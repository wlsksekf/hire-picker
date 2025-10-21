package com.hirepicker.controller;

import com.hirepicker.service.TossPaymentService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Map;

@Controller // Spring의 컨트롤러 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class PaymentController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass()); // 로거
    private final TossPaymentService tossPaymentService; // 토스페이먼츠 서비스

    // 결제 위젯 또는 결제 승인 처리
    @RequestMapping(value = {"/confirm/widget", "/confirm/payment"})
    public ResponseEntity<Map<String, Object>> confirmPayment(HttpServletRequest request, @RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.confirmPayment(request, jsonBody);
        int statusCode = response.containsKey("error") ? 400 : 200;
        return ResponseEntity.status(statusCode).body(response);
    }

    // 자동 결제 승인 처리
    @RequestMapping(value = "/confirm-billing")
    public ResponseEntity<Map<String, Object>> confirmBilling(@RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.confirmBilling(jsonBody);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    // 빌링키 발급 처리
    @RequestMapping(value = "/issue-billing-key")
    public ResponseEntity<Map<String, Object>> issueBillingKey(@RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.issueBillingKey(jsonBody);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    // 브랜드페이 인증 콜백 처리
    @RequestMapping(value = "/callback-auth", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> callbackAuth(@RequestParam String customerKey, @RequestParam String code) throws Exception {
        Map<String, Object> response = tossPaymentService.callbackAuth(customerKey, code);
        logger.info("응답 데이터: {}", response);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    // 브랜드페이 결제 승인 처리
    @RequestMapping(value = "/confirm/brandpay", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<Map<String, Object>> confirmBrandpay(@RequestBody String jsonBody) throws Exception {
        Map<String, Object> response = tossPaymentService.confirmBrandpay(jsonBody);
        return ResponseEntity.status(response.containsKey("error") ? 400 : 200).body(response);
    }

    // 결제 실패 처리
    @RequestMapping(value = "/fail", method = RequestMethod.GET)
    public String failPayment(HttpServletRequest request, Model model) {
        model.addAttribute("code", request.getParameter("code"));
        model.addAttribute("message", request.getParameter("message"));
        return "/fail";
    }
}