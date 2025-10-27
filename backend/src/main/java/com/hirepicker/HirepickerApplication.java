package com.hirepicker;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication // Spring Boot 애플리케이션임을 선언
@EnableScheduling // 스케줄링 기능 활성화
public class HirepickerApplication {

    public static void main(String[] args) {
        Dotenv.load(); // ★ .env 파일 로드
        SpringApplication.run(HirepickerApplication.class, args);
    }

}