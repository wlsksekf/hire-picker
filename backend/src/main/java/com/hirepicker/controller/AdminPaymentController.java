package com.hirepicker.controller;

import com.hirepicker.dto.admin.PaymentStatisticsDto;
import com.hirepicker.service.AdminPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자 페이지 결제 통계 API 컨트롤러
 */
@Tag(name = "관리자 - 결제", description = "관리자 페이지 결제 통계 및 관리 API")
@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService adminPaymentService;

    @Operation(summary = "결제 통계 조회", description = "관리자 페이지용 결제 통계 데이터를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "통계 조회 성공")
    })
    @GetMapping("/statistics")
    public ResponseEntity<PaymentStatisticsDto> getPaymentStatistics() {
        PaymentStatisticsDto statistics = adminPaymentService.getPaymentStatistics();
        return ResponseEntity.ok(statistics);
    }
}


