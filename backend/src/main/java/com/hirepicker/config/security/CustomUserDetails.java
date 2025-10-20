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

@Getter
public class CustomUserDetails implements UserDetails, OAuth2User {

    private final PersonalUser personalUser;
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

    // UserDetails 인터페이스 메서드 구현
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return personalUser.getPassword();
    }

    @Override
    public String getUsername() {
        return personalUser.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !personalUser.isCancel();
    }

    // OAuth2User 인터페이스 메서드 구현
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        // OAuth2 공급자로부터 받은 사용자의 고유 식별자를 반환할 수 있으나,
        // 여기서는 이메일을 고유 식별자로 사용합니다.
        return personalUser.getEmail();
    }
}
