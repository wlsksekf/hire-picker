package com.hirepicker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health Check", description = "서버 상태 확인 API 그룹") // Swagger 태그 설정
@RestController // REST 컨트롤러임을 선언
@RequestMapping("/api/health") // "/api/health" 경로에 매핑
public class HealthController {

    @Operation(summary = "서버 헬스 체크", description = "서버가 정상적으로 동작하는지 확인합니다.") // Swagger Operation 설정
    @GetMapping // HTTP GET 요청에 매핑
    public ResponseEntity<String> checkHealth() {
        return ResponseEntity.ok("서버가 정상적으로 동작합니다!"); // 성공 응답 반환
    }
}
