package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.PersonalUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PersonalUserRepository personalUserRepository;
    private final CompanyUserRepository companyUserRepository; // 기업 유저 리포지토리 추가

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("[Auth] loadUserByUsername 호출. 사용자명: {}", username);
        // 먼저 개인 유저(이메일 기준)를 찾음
        return personalUserRepository.findByEmail(username)
                .<UserDetails>map(user -> {
                    log.info("[Auth] 개인 사용자를 찾았습니다: {}", username);
                    return new CustomUserDetails(user);
                })
                .orElseGet(() -> {
                    log.info("[Auth] 개인 사용자를 찾지 못해 기업 사용자를 조회합니다: {}", username);
                    // 개인 유저가 없으면 기업 유저(로그인 ID 기준)를 찾음
                    return companyUserRepository.findByLoginId(username)
                        .map(user -> {
                            log.info("[Auth] 기업 사용자를 찾았습니다: {}", username);
                            return new CustomUserDetails(user);
                        })
                        .orElseThrow(() -> {
                            log.warn("[Auth] 사용자를 찾지 못했습니다: {}", username);
                            return new UsernameNotFoundException("User not found with username: " + username);
                        });
                });
    }
}