package com.hirepicker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.ReportRequestDto;
import com.hirepicker.service.ReportService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<?> reportPost(@RequestBody ReportRequestDto dto,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        reportService.createReport(dto, userDetails.getId());
        return ResponseEntity.ok().body("신고 완료되었습니다.");
    }
}
