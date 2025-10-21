package com.hirepicker.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration // Spring의 설정 클래스임을 선언
public class DotenvConfig {

    @Bean // Spring의 빈으로 등록
    public Dotenv dotenv() {
        // .env 파일을 로드하여 Dotenv 객체를 생성
        // directory("../")는 상위 디렉토리에서 .env 파일을 찾도록 설정
        // ignoreIfMissing()은 .env 파일이 없어도 오류를 발생시키지 않도록 설정
        return Dotenv.configure().directory("../").ignoreIfMissing().load();
    }
}