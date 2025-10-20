package com.hirepicker.handler;

import com.hirepicker.exception.SocialAccountNeedsPasswordException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SocialAccountNeedsPasswordException.class)
    public ResponseEntity<Map<String, String>> handleSocialAccountNeedsPasswordException(SocialAccountNeedsPasswordException ex) {
        // 프론트엔드와 약속한 에러 코드를 반환
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED) // 401 Unauthorized
                .body(Map.of("error", "SOCIAL_ACCOUNT_NEEDS_PASSWORD_SETUP", "message", ex.getMessage()));
    }

    // 다른 예외 핸들러들...
}
