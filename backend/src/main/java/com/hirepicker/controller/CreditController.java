package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService creditService;

    /**
     * 현재 로그인한 사용자의 크레딧 잔액 조회 API
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Long>> getCreditBalance(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long balance = creditService.getCreditBalance(userDetails);
        return ResponseEntity.ok(Map.of("balance", balance));
    }
}
