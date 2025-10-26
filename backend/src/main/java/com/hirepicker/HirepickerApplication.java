package com.hirepicker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication // Spring Boot 애플리케이션임을 선언
@EnableScheduling // 스케줄링 기능 활성화
public class HirepickerApplication {

    public static void main(String[] args) {
        SpringApplication.run(HirepickerApplication.class, args);
    }

}