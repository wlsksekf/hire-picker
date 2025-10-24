package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.service.AiResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai") // API 기본 경로
@RequiredArgsConstructor
public class AiResumeController {

    private final AiResumeService aiResumeService;

    /**
     * AI 이력서 문장 생성 API
     * 예) /api/ai/generate-resume?keywords=react,spring
     */
    @GetMapping("/generate-resume")
    public ResponseEntity<String> generateResume(
            @RequestParam String keywords,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // 사용자 정보 주입
        String generatedText = aiResumeService.generateResumeSection(keywords, userDetails);
        
        // AI가 생성한 텍스트를 JSON 형태가 아닌 순수 텍스트(String)로 바로 반환
        return ResponseEntity.ok(generatedText);
    }
}
