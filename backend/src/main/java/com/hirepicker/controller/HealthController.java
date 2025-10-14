package com.hirepicker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health Check", description = "서버 상태 확인 API")
@RestController @RequestMapping("/api/health")
public class HealthController {

    @Operation(summary = "서버 헬스 체크", description = "서버가 정상적으로 동작하는지 확인합니다.")
    @GetMapping
    public ResponseEntity<String> checkHealth() {
        return ResponseEntity.ok("Server is healthy!");
    }
}