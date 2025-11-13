package com.hirepicker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.ReportRequestDto;
import com.hirepicker.dto.ReportResponseDto;
import com.hirepicker.service.ReportService;


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

    @GetMapping
    public ResponseEntity<List<ReportResponseDto>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

}
