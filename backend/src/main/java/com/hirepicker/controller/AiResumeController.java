package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.ai.FullResumeDraftDto;
import com.hirepicker.service.AiResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiResumeController {

    private final AiResumeService aiResumeService;

    @PostMapping("/generate-full-draft")
    public ResponseEntity<FullResumeDraftDto> generateFullDraft(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        String keywords = payload.get("prompt");
        Long userId = userDetails.getId();
        
        FullResumeDraftDto draft = aiResumeService.generateFullDraft(keywords, userId);
        return ResponseEntity.ok(draft);
    }
}
