package com.hirepicker.config.security;

import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.ManageUser;
import com.hirepicker.entity.UserType;
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

    private final Long id;
    private final String username; // email or loginId
    private final String password;
    private final boolean isEnabled;
    private final UserType userType;
    private Map<String, Object> attributes; // OAuth2
    private boolean signupBonusGranted;

    // 생성자: 개인 또는 기업 유저에 따라 CustomUserDetails 생성
    public CustomUserDetails(PersonalUser personalUser) {
        this.id = personalUser.getId();
        this.username = personalUser.getEmail();
        this.password = personalUser.getPassword();
        this.isEnabled = !personalUser.isCancel();
        this.userType = UserType.PERSONAL;
    }

    public CustomUserDetails(CompanyUser companyUser) {
        this.id = companyUser.getId();
        this.username = companyUser.getLoginId();
        this.password = companyUser.getPassword();
        this.isEnabled = !companyUser.isCancel();
        this.userType = UserType.COMPANY;
    }

    public CustomUserDetails(ManageUser manageUser) {
        this.id = manageUser.getId();
        this.username = manageUser.getLoginId();
        this.password = manageUser.getPassword();
        this.isEnabled = true; // 관리자 계정은 별도 비활성화 플래그 없음
        this.userType = UserType.MANAGE;
    }

    // OAuth2 로그인용 생성자 (PersonalUser만 해당)
    public CustomUserDetails(PersonalUser personalUser, Map<String, Object> attributes) {
        this.id = personalUser.getId();
        this.username = personalUser.getEmail();
        this.password = personalUser.getPassword();
        this.isEnabled = !personalUser.isCancel();
        this.userType = UserType.PERSONAL;
        this.attributes = attributes;
    }

    // JWT 토큰에서 직접 CustomUserDetails를 생성하기 위한 생성자
    public CustomUserDetails(Long id, String username, UserType userType) {
        this.id = id;
        this.username = username;
        this.password = null; // 토큰에는 비밀번호가 없으므로 null
        this.isEnabled = true; // 토큰이 유효하다는 것은 계정이 활성화되었다는 의미로 간주
        this.userType = userType;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 여기에서 userType에 따라 다른 ROLE을 부여할 수 있음
        if (userType == UserType.COMPANY) {
            return Collections.singleton(new SimpleGrantedAuthority("ROLE_COMPANY"));
        }
        if (userType == UserType.MANAGE) {
            return Collections.singleton(new SimpleGrantedAuthority("ROLE_MANAGE"));
        }
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_PERSONAL"));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
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
        return isEnabled;
    }

    // OAuth2User 인터페이스 메서드
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        // OAuth2에서는 보통 고유 식별자를 반환
        return String.valueOf(id);
    }

    public void markSignupBonusGranted() {
        this.signupBonusGranted = true;
    }
}