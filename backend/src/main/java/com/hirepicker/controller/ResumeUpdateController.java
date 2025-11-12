package com.hirepicker.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.service.ProfileService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ResumeUpdateController {

    private final ProfileService profileService;

    @Operation(summary = "이력서 수정")
    @PutMapping("/resume/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> updateResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long resumeId,
            @RequestBody Map<String, Object> body) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String title = (String) body.get("title");
        String selfGrowth = (String) body.get("selfGrowth");
        String selfStrengths = (String) body.get("selfStrengths");
        String selfMotivation = (String) body.get("selfMotivation");
        String selfAspirations = (String) body.get("selfAspirations");
        String imageUrl = (String) body.get("imageUrl");
        Integer creditCost = null;
        Object creditCostObj = body.get("creditCost") != null ? body.get("creditCost") : body.get("credit_cost");
        if (creditCostObj instanceof Number number) {
            creditCost = number.intValue();
        } else if (creditCostObj instanceof String str) {
            try {
                creditCost = Integer.parseInt(str);
            } catch (NumberFormatException ignored) { /* 잘못된 값이면 무시 */ }
        }
        String status = (String) body.get("status");
        String cert = (String) body.get("cert");
        Long expIdx = null;
        Object exp = body.get("expIdx");
        if (exp instanceof Number) expIdx = ((Number) exp).longValue();

        int updated = profileService.updateResume(userDetails.getId(), resumeId, title, selfGrowth, selfStrengths, selfMotivation, selfAspirations, imageUrl, creditCost, status, cert, expIdx);
        if (updated == 0) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "이력서가 없거나 수정할 항목이 없습니다."));
        return ResponseEntity.ok(Map.of("message", "이력서가 수정되었습니다."));
    }

    @Operation(summary = "이력서 삭제")
    @DeleteMapping("/resume/{id}")
    @Transactional
    public ResponseEntity<Map<String, String>> deleteResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") Long resumeId) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            boolean deleted = profileService.deleteResume(userDetails.getId(), resumeId);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "이력서를 찾을 수 없습니다."));
            }
            return ResponseEntity.ok(Map.of("message", "이력서가 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }
}

