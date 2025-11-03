package com.hirepicker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration // Spring의 설정 클래스임을 선언
public class EncoderConfig {

    @Bean // Spring의 빈으로 등록
    public PasswordEncoder passwordEncoder() {
        // BCryptPasswordEncoder를 사용하여 비밀번호를 암호화
        return new BCryptPasswordEncoder();
    }
}