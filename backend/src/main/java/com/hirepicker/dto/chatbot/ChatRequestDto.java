package com.hirepicker.dto.chatbot;

// record를 사용하여 불변의 간단한 데이터 객체를 정의
public record ChatRequestDto(String prompt, String sessionId) {}
