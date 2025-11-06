package com.hirepicker.config;

import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Google GenAI 클라이언트를 스프링 빈으로 등록하는 설정 클래스
 */
@Configuration
public class GenAiConfig {

    @Bean
    public Client genaiClient() {
        // GOOGLE_API_KEY 환경변수를 자동으로 사용
        return new Client();
    }
}
