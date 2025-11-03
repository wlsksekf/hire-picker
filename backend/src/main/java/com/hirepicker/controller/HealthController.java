package com.hirepicker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health Check", description = "서버 상태 확인 API 그룹")
@RestController
@RequestMapping("/api/health") // "/api/health" 경로에 매핑
public class HealthController {

    @Operation(summary = "서버 헬스 체크", description = "서버가 정상적으로 동작하는지 확인합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "서버 정상 동작")
    })
    @GetMapping
    public ResponseEntity<String> checkHealth() {
        return ResponseEntity.ok("서버가 정상적으로 동작합니다!"); // 성공 응답 반환
    }
}
