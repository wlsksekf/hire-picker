package com.hirepicker.controller;

import com.hirepicker.dto.CompanySignupRequestDto;
import com.hirepicker.dto.LoginRequest;
import com.hirepicker.dto.LoginResponse;
import com.hirepicker.dto.SignupRequestDto; // ★ 새로 만든 DTO 임포트
import com.hirepicker.service.AuthService;
import com.hirepicker.service.EmailService; // ★ EmailService 임포트
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "인증", description = "사용자 인증 및 토큰 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService; // ★ EmailService 주입

    /**
     * [신규] 회원가입을 위한 이메일 인증 코드 발송
     */
    @Operation(summary = "이메일 인증 코드 발송", description = "회원가입을 위해 이메일로 인증 코드를 발송합니다.")
    @PostMapping("/send-verification")
    public ResponseEntity<String> sendVerificationCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        log.info("[API] /api/auth/send-verification 요청 수신. 이메일: {}", email);
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이메일을 입력해주세요.");
        }

        // (개선) 이미 가입된 이메일인지 AuthService에서 확인
        if (authService.isEmailDuplicate(email)) { // authService에 isEmailDuplicate 메서드 구현 필요
             log.warn("이미 가입된 이메일입니다: {}", email);
             return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 가입된 이메일입니다.");
        }

        try {
            emailService.sendVerificationCode(email);
            log.info("인증 코드가 성공적으로 발송되었습니다. 이메일: {}", email);
            return ResponseEntity.ok("인증 코드가 발송되었습니다.");
        } catch (Exception e) {
            log.error("이메일 발송 중 오류 발생. 이메일: {}", email, e);
            // EmailService에서 던진 RuntimeException 처리
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * [신규] 이메일 인증 코드 확인
     */
    @Operation(summary = "이메일 인증 코드 확인", description = "입력된 인증 코드가 유효한지 확인하고 '인증 완료' 상태로 변경합니다.")
    @PostMapping("/check-verification")
    public ResponseEntity<String> checkVerificationCode(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String code = payload.get("verificationCode");
        log.info("[API] /api/auth/check-verification 요청 수신. 이메일: {}", email);

        // [수정] verifyCodeAndSetStatus 호출
        boolean isVerified = emailService.verifyCodeAndSetStatus(email, code);

        if (isVerified) {
            return ResponseEntity.ok("이메일이 성공적으로 인증되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("인증 코드가 유효하지 않거나 만료되었습니다.");
        }
    }

    /**
     * [수정] 개인 회원 회원가입 처리 ('인증 완료' 상태 검증)
     */
    @Operation(summary = "개인 회원가입", description = "'인증 완료' 상태 확인 후 개인 회원으로 가입합니다.")
    @PostMapping("/signup/personal")
    public ResponseEntity<?> registerPersonalUser(@RequestBody SignupRequestDto signupRequest) {
        log.info("[API] /api/auth/signup/personal 요청 수신. 사용자: {}", signupRequest.getEmail());

        // 1. (★수정) '인증 완료' 상태 검증
        boolean isVerified = emailService.isEmailVerified(signupRequest.getEmail());

        if (!isVerified) {
            log.warn("'인증 완료' 상태가 아닙니다. 이메일: {}", signupRequest.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이메일 인증이 완료되지 않았거나 만료되었습니다.");
        }

        // 2. (검증 통과) 기존 회원가입 로직 수행
        try {
            LoginResponse response = authService.registerPersonalUser(signupRequest); 
            log.info("개인 회원가입 성공. 사용자: {}", signupRequest.getEmail());
            // 3. 성공 응답 (JWT 토큰 포함)
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
             log.warn("회원가입 중 충돌 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            log.error("회원가입 처리 중 알 수 없는 오류 발생. 사용자: {}", signupRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 오류가 발생했습니다.");
        }
    }

    /**
     * [신규] 기업 회원 회원가입 처리
     */
    @Operation(summary = "기업 회원가입", description = "이메일 인증 후 기업 회원으로 가입합니다.")
    @PostMapping("/signup/company")
    public ResponseEntity<?> registerCompanyUser(@RequestBody CompanySignupRequestDto signupRequest) {
        log.info("[API] /api/auth/signup/company 요청 수신. 사용자 ID: {}", signupRequest.getId());

        // (★수정) '인증 완료' 상태 검증
        boolean isVerified = emailService.isEmailVerified(signupRequest.getEmail());

        if (!isVerified) {
            log.warn("'인증 완료' 상태가 아닙니다. 이메일: {}", signupRequest.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이메일 인증이 완료되지 않았거나 만료되었습니다.");
        }

        try {
            LoginResponse response = authService.registerCompanyUser(signupRequest);
            log.info("기업 회원가입 성공. 사용자 ID: {}", signupRequest.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("회원가입 중 충돌 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            log.error("회원가입 처리 중 알 수 없는 오류 발생. 사용자 ID: {}", signupRequest.getId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("회원가입 중 오류가 발생했습니다.");
        }
    }

    /**
     * [기존] 로그인 (개인/기업)
     */
    @Operation(summary = "로그인", description = "이메일과 비밀번호를 사용하여 로그인하고 JWT 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        log.info("[API] /api/auth/login 요청 수신. 사용자: {}", loginRequest.getEmail());
        LoginResponse loginResponse = authService.login(loginRequest);
        return ResponseEntity.ok(loginResponse);
    }
}