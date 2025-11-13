package com.hirepicker.util;

/**
 * 로그 마스킹 유틸리티
 * - 개인정보 보호를 위한 민감 정보 마스킹
 * - GDPR, 개인정보보호법 준수
 */
public class LogMaskingUtils {

    /**
     * 이메일 마스킹
     * 예: user@example.com -> use***@***
     */
    public static String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "***";
        }
        
        if (!email.contains("@")) {
            return email.substring(0, Math.min(3, email.length())) + "***";
        }
        
        String[] parts = email.split("@");
        String localPart = parts[0];
        int visibleChars = Math.min(3, localPart.length());
        
        return localPart.substring(0, visibleChars) + "***@***";
    }

    /**
     * 전화번호 마스킹
     * 예: 010-1234-5678 -> 010-****-5678
     */
    public static String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return "***";
        }
        
        // 숫자만 추출
        String digits = phoneNumber.replaceAll("[^0-9]", "");
        
        if (digits.length() < 4) {
            return "***";
        }
        
        // 뒤 4자리만 표시
        return "***-****-" + digits.substring(digits.length() - 4);
    }

    /**
     * 이름 마스킹
     * 예: 홍길동 -> 홍*동, John Doe -> J*** D**
     */
    public static String maskName(String name) {
        if (name == null || name.isEmpty()) {
            return "***";
        }
        
        if (name.length() <= 2) {
            return name.charAt(0) + "*";
        }
        
        // 공백으로 구분된 경우 (영문 이름)
        if (name.contains(" ")) {
            String[] parts = name.split(" ");
            StringBuilder masked = new StringBuilder();
            for (int i = 0; i < parts.length; i++) {
                if (i > 0) masked.append(" ");
                String part = parts[i];
                masked.append(part.charAt(0)).append("*".repeat(part.length() - 1));
            }
            return masked.toString();
        }
        
        // 한글 이름 (3자 이상)
        return name.charAt(0) + "*".repeat(name.length() - 2) + name.charAt(name.length() - 1);
    }
}

