package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.service.CreditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "크레딧", description = "크레딧 관련 API")
@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService creditService;

    @Operation(summary = "크레딧 잔액 조회", description = "현재 로그인한 사용자의 크레딧 잔액을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "크레딧 잔액 조회 성공")
    })
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Long>> getCreditBalance(@Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long balance = creditService.getCreditBalance(userDetails);
        return ResponseEntity.ok(Map.of("balance", balance));
    }
}
