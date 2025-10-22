package com.hirepicker.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.PersonalUserRepository;

import lombok.RequiredArgsConstructor;

@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PersonalUserRepository personalUserRepository; // 사용자 리포지토리

    // 이메일을 사용하여 사용자 정보를 로드하는 메서드
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        PersonalUser personalUser = personalUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));
        return new CustomUserDetails(personalUser); // CustomUserDetails 객체 반환
    }
}