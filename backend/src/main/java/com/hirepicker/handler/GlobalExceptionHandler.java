package com.hirepicker.handler;

import com.hirepicker.exception.SocialAccountNeedsPasswordException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice // 모든 @RestController에서 발생하는 예외를 처리
public class GlobalExceptionHandler {

    // SocialAccountNeedsPasswordException 예외 처리
    @ExceptionHandler(SocialAccountNeedsPasswordException.class)
    public ResponseEntity<Map<String, String>> handleSocialAccountNeedsPasswordException(SocialAccountNeedsPasswordException ex) {
        // 프론트엔드와 약속한 에러 코드를 반환
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED) // 401 Unauthorized
                .body(Map.of("error", "SOCIAL_ACCOUNT_NEEDS_PASSWORD_SETUP", "message", ex.getMessage()));
    }

    // 예상치 못한 모든 서버 오류를 처리하는 핸들러 추가
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllUncaughtException(Exception ex) {
        // 서버 로그에는 전체 에러를 기록해서 원인 파악을 쉽게 함
        // log.error("Unhandled server error occurred: ", ex);
        
        // 클라이언트에게는 상세 내용을 숨기고 일반적인 에러 메시지를 반환
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR) // 500 Internal Server Error
                .body(Map.of("error", "INTERNAL_SERVER_ERROR", "message", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."));
    }
}