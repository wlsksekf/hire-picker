package com.hirepicker.config;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;

/**
 * Rate Limiting 설정
 * - Bucket4j를 사용한 IP 기반 요청 제한
 * - 무차별 대입 공격(Brute Force) 방지
 * - 로그인 시도 제한: IP당 5분에 10회
 */
@Slf4j
@Component
public class RateLimitConfig {

    // IP 주소별 Bucket 저장소
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * 로그인 전용 Rate Limit
     * - 5분에 10회 시도 허용
     * - 초과 시 일시적으로 차단
     */
    private Bucket createLoginBucket() {
        Bandwidth limit = Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(5)));
        return Bucket4j.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * IP 주소에 대한 Bucket 가져오기 (없으면 생성)
     */
    public Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, k -> createLoginBucket());
    }

    /**
     * 요청 허용 여부 확인
     * @param key 식별자 (IP 주소 등)
     * @return true: 허용, false: 제한
     */
    public boolean tryConsume(String key) {
        Bucket bucket = resolveBucket(key);
        boolean allowed = bucket.tryConsume(1);
        
        if (!allowed) {
            log.warn("[RateLimit] 요청 제한 초과: key={}", key);
        }
        
        return allowed;
    }

    /**
     * 특정 키의 Rate Limit 초기화
     * (테스트 또는 특정 조건에서 사용)
     */
    public void reset(String key) {
        buckets.remove(key);
        log.info("[RateLimit] Reset for key: {}", key);
    }
}

