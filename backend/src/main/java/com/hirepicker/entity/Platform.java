package com.hirepicker.entity;

import java.util.Arrays;

// 플랫폼 종류 (자체, 카카오, 구글, 네이버)
public enum Platform {
    LOCAL, KAKAO, GOOGLE, NAVER;

    public static Platform fromRegistrationId(String registrationId) {
        return Arrays.stream(values())
                .filter(platform -> platform.name().equalsIgnoreCase(registrationId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported platform: " + registrationId));
    }
}