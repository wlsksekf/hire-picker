package com.hirepicker.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DotenvConfig {

    @Bean
    public Dotenv dotenv() {
        // .env 파일을 로드합니다. 기본적으로 프로젝트 루트에서 .env 파일을 찾습니다.
        // .env 파일이 없거나 다른 위치에 있다면, .load() 대신 .configure().directory("경로").load() 등을 사용할 수 있습니다.
        return Dotenv.configure().directory("../").load();
    }
}
