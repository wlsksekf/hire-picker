package com.hirepicker.dto;

import lombok.Data;

@Data
public class CompanySignupRequestDto {
    
    private String id; // 로그인 아이디
    private String password;
    private String name; // 담당자 이름
    private String email;
    private String phone_number;
    private String verificationCode; // 이메일 인증 코드
    private Long companyIdx; // 선택된 회사의 ID
}
