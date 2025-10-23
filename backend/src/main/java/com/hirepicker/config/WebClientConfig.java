package com.hirepicker.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

// 토스 API 호출을 위한 WebClient 빈 등록 설정
@Configuration
public class WebClientConfig {

    @Value("${toss.api-url}")
    private String tossApiUrl;

    @Bean
    public WebClient tossWebClient() {
        return WebClient.builder()
                .baseUrl(tossApiUrl)
                .build();
    }
}
