package com.hirepicker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "웹훅", description = "외부 서비스 웹훅 수신 API")
@Slf4j
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @Operation(summary = "카카오 웹훅 수신", description = "카카오로부터 웹훅 이벤트를 수신합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "웹훅 수신 성공")
    })
    @PostMapping("/kakao")
    public ResponseEntity<Void> handleKakaoWebhook(
            @Parameter(description = "웹훅 페이로드", required = true) @RequestBody Map<String, Object> payload) {
        log.info("Received Kakao Webhook: {}", payload);

        // TODO: 웹훅 이벤트 타입에 따른 비즈니스 로직 처리
        // 예: payload.get("event_type")에 따라 분기
        // - 사용자 연결/해제 시 DB 상태 업데이트
        // - 동의 항목 변경 시 DB 업데이트 등

        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @Operation(summary = "네이버 웹훅 수신", description = "네이버로부터 연결 해제 웹훅을 수신합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "웹훅 수신 성공")
    })
    @PostMapping("/naver")
    public ResponseEntity<Void> handleNaverWebhook(
            @Parameter(description = "웹훅 페이로드", required = true) @RequestBody Map<String, Object> payload) {
        log.info("Received Naver Webhook (Disconnect Callback): {}", payload);

        // TODO: 네이버 연결 끊기 시 비즈니스 로직 처리
        // access_token을 사용하여 사용자를 식별하고 DB에서 관련 정보를 비활성화 또는 삭제

        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
