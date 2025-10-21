package com.hirepicker;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication // Spring Boot 애플리케이션임을 선언
@EnableScheduling // 스케줄링 기능 활성화
public class HirepickerApplication {

    public static void main(String[] args) {
        // 상위 디렉토리에서 .env 파일 로드
        Dotenv dotenv = Dotenv.configure().directory("../").ignoreIfMissing().load();

        // .env 파일의 모든 항목을 시스템 속성으로 설정
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

        SpringApplication.run(HirepickerApplication.class, args);
    }

}