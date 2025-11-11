package com.hirepicker.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ManageLoginResponse {

    private final Long mUserIdx;       // 관리자 PK
    private final Long refreshIdx;     // RefreshToken FK (nullable)
    private final String id;           // 관리자 로그인 아이디
    private final String password;     // 비밀번호(보안상 null 반환)
    private final String name;         // 관리자 이름
    private final String phoneNumber;  // 관리자 연락처
    private final Byte authority;      // 권한 코드
}

