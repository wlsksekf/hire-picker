package com.hirepicker.config.security;

import com.hirepicker.entity.PersonalUser;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter // 모든 필드에 대한 Getter 자동 생성
public class CustomUserDetails implements UserDetails, OAuth2User {

    private final PersonalUser personalUser; // 사용자 정보
    private Map<String, Object> attributes; // OAuth2 로그인 시 사용될 속성

    // 일반 로그인용 생성자
    public CustomUserDetails(PersonalUser personalUser) {
        this.personalUser = personalUser;
    }

    // OAuth2 로그인용 생성자
    public CustomUserDetails(PersonalUser personalUser, Map<String, Object> attributes) {
        this.personalUser = personalUser;
        this.attributes = attributes;
    }

    // 사용자의 권한을 반환
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
    }

    // 사용자의 비밀번호를 반환
    @Override
    public String getPassword() {
        return personalUser.getPassword();
    }

    // 사용자의 이메일(사용자 이름)을 반환
    @Override
    public String getUsername() {
        return personalUser.getEmail();
    }

    // 계정이 만료되지 않았는지 확인
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 계정이 잠기지 않았는지 확인
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 자격 증명이 만료되지 않았는지 확인
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 계정이 활성화되었는지 확인
    @Override
    public boolean isEnabled() {
        return !personalUser.isCancel();
    }

    // OAuth2 사용자의 속성을 반환
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    // OAuth2 사용자의 이름을 반환
    @Override
    public String getName() {
        return personalUser.getEmail();
    }
}