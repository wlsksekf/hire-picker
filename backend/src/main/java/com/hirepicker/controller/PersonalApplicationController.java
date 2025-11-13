package com.hirepicker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.ApplicationStatusDto;
import com.hirepicker.service.ApplicationQueryService;

import lombok.RequiredArgsConstructor;

/**
 * 개인회원 지원 현황 조회 컨트롤러.
 */
@RestController
@RequestMapping("/api/personal/applications")
@RequiredArgsConstructor
public class PersonalApplicationController {

    private final ApplicationQueryService applicationQueryService;

    @GetMapping
    public ResponseEntity<List<ApplicationStatusDto>> getMyApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long personalUserId = userDetails.getId();
        List<ApplicationStatusDto> results = applicationQueryService.getApplicationsByPersonalUser(personalUserId);
        return ResponseEntity.ok(results);
    }
}

