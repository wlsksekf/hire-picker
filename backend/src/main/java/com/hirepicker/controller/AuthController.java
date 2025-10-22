package com.hirepicker.controller;

import com.hirepicker.dto.LoginRequest;
import com.hirepicker.dto.LoginResponse;
import com.hirepicker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation; // Added import
import io.swagger.v3.oas.annotations.tags.Tag;   // Added import
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "인증", description = "사용자 인증 및 토큰 관련 API") // Added Tag
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "로그인", description = "이메일과 비밀번호를 사용하여 로그인하고 JWT 토큰을 발급받습니다.") // Added Operation
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity.ok(loginResponse);
    }
}