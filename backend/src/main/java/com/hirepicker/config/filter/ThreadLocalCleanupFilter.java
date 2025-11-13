package com.hirepicker.config.filter;

import java.io.IOException;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.hirepicker.service.UserDetailsServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

/**
 * ThreadLocal 자동 정리 필터
 * - 모든 요청 처리 후 ThreadLocal 변수를 자동으로 정리하여 메모리 누수 방지
 * - ThreadPool 환경에서 스레드 재사용 시 이전 요청의 데이터가 남는 것을 방지
 */
@Slf4j
@Component
@Order(1) // 가장 먼저 실행되도록 설정
public class ThreadLocalCleanupFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // 다음 필터로 요청 전달
            filterChain.doFilter(request, response);
        } finally {
            // 요청 처리 완료 후 반드시 ThreadLocal 정리
            UserDetailsServiceImpl.clearUserType();
            log.trace("ThreadLocal cleaned up for request: {}", request.getRequestURI());
        }
    }
}

