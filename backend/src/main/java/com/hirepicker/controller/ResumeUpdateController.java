package com.hirepicker.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.service.ProfileService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ResumeUpdateController {

    private final ProfileService profileService;

    @Operation(summary = "이력서 수정")
    @PutMapping("/api/resume/{id}")
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
        Boolean isDefault = body.get("isDefault") instanceof Boolean ? (Boolean) body.get("isDefault") : null;
        String status = (String) body.get("status");
        String cert = (String) body.get("cert");
        Long expIdx = null;
        Object exp = body.get("expIdx");
        if (exp instanceof Number) expIdx = ((Number) exp).longValue();

        int updated = profileService.updateResume(userDetails.getId(), resumeId, title, selfGrowth, selfStrengths, selfMotivation, selfAspirations, imageUrl, isDefault, status, cert, expIdx);
        if (updated == 0) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "이력서가 없거나 수정할 항목이 없습니다."));
        return ResponseEntity.ok(Map.of("message", "이력서가 수정되었습니다."));
    }
}

