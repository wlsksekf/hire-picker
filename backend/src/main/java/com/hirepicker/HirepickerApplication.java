package com.hirepicker;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication // Spring Boot 애플리케이션임을 선언
@EnableScheduling // 스케줄링 기능 활성화
public class HirepickerApplication {

    public static void main(String[] args) {

        // 시스템 환경 변수에서 SPRING_PROFILES_ACTIVE 값을 읽어옴
        String profile = System.getenv("SPRING_PROFILES_ACTIVE");

        // profile이 "prod"가 아닐 경우에만 (즉, "local"이거나 설정되지 않았을 때)
        // .env 파일을 로드함
        if (profile == null || !profile.equals("prod")) {
            Dotenv.configure().directory("../").load(); // .env 파일 로드 (상위 경로)
        }

        SpringApplication.run(HirepickerApplication.class, args);
    }

}