package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.PersonalUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Spring Security UserDetailsService 구현체
 *
 * 역할: 사용자 인증 시 username(이메일 또는 아이디)으로 사용자 정보를 조회
 *
 * 특징:
 * - ThreadLocal을 사용하여 AuthService로부터 userType을 전달받음
 * - userType에 따라 효율적으로 해당 테이블만 검색
 * - 개인회원/기업회원 통합 로그인 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PersonalUserRepository personalUserRepository;
    private final CompanyUserRepository companyUserRepository;

    /**
     * ThreadLocal을 사용하여 userType을 스레드 간 안전하게 전달
     *
     * 이유: UserDetailsService.loadUserByUsername()은 Spring Security가 호출하므로
     *      직접 파라미터를 전달할 수 없음. 따라서 ThreadLocal을 통해 간접 전달
     *
     * 주의: 반드시 사용 후 clearUserType()으로 정리해야 메모리 누수 방지
     */
    private static final ThreadLocal<UserType> userTypeThreadLocal = new ThreadLocal<>();

    /**
     * userType을 ThreadLocal에 설정
     *
     * @param userType 회원 타입 (PERSONAL 또는 COMPANY)
     * 호출 시점: AuthService.login() 시작 시
     */
    public static void setUserType(UserType userType) {
        userTypeThreadLocal.set(userType);
    }

    /**
     * ThreadLocal에서 userType 제거
     *
     * 호출 시점: AuthService.login() 종료 시 (성공/실패 모두)
     * 중요: 메모리 누수 방지를 위해 반드시 호출해야 함
     */
    public static void clearUserType() {
        userTypeThreadLocal.remove();
    }

    /**
     * 사용자 정보 조회 (Spring Security가 인증 시 자동 호출)
     *
     * 흐름:
     * 1. ThreadLocal에서 userType 가져오기
     * 2. userType에 따라 해당 테이블만 검색
     *    - PERSONAL: personalUserRepository.findByEmail()
     *    - COMPANY: companyUserRepository.findByLoginId()
     *    - null: 순차 검색 (하위 호환성)
     * 3. 찾은 엔티티를 CustomUserDetails로 변환하여 반환
     *
     * @param username 사용자 식별자 (개인회원: 이메일, 기업회원: 로그인 아이디)
     * @return UserDetails 인증에 사용할 사용자 정보
     * @throws UsernameNotFoundException 사용자를 찾을 수 없는 경우
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // ThreadLocal에서 userType 가져오기 (AuthService에서 설정한 값)
        UserType userType = userTypeThreadLocal.get();
        log.info("[Auth] loadUserByUsername 호출. 사용자명: {}, 타입: {}", username, userType);

        // === 경로 1: 개인회원 검색 (효율적) ===
        if (userType == UserType.PERSONAL) {
            log.info("[Auth] 개인 사용자로 검색합니다: {}", username);
            // personal_user 테이블에서 email로 검색
            return personalUserRepository.findByEmail(username)
                    .map(user -> {
                        log.info("[Auth] 개인 사용자를 찾았습니다: {}", username);
                        // PersonalUser 엔티티를 CustomUserDetails로 변환
                        return (UserDetails) new CustomUserDetails(user);
                    })
                    .orElseThrow(() -> {
                        log.warn("[Auth] 개인 사용자를 찾지 못했습니다: {}", username);
                        return new UsernameNotFoundException("Personal user not found with email: " + username);
                    });
        }
        // === 경로 2: 기업회원 검색 (효율적) ===
        else if (userType == UserType.COMPANY) {
            log.info("[Auth] 기업 사용자로 검색합니다: {}", username);
            // company_user 테이블에서 login_id로 검색
            return companyUserRepository.findByLoginId(username)
                    .map(user -> {
                        log.info("[Auth] 기업 사용자를 찾았습니다: {}", username);
                        // CompanyUser 엔티티를 CustomUserDetails로 변환
                        return (UserDetails) new CustomUserDetails(user);
                    })
                    .orElseThrow(() -> {
                        log.warn("[Auth] 기업 사용자를 찾지 못했습니다: {}", username);
                        return new UsernameNotFoundException("Company user not found with login ID: " + username);
                    });
        }

        // === 경로 3: 순차 검색 (하위 호환성, userType이 없는 경우) ===
        // OAuth2 로그인 등 userType이 지정되지 않은 경우를 위한 폴백 로직
        log.info("[Auth] userType이 지정되지 않아 순차 검색합니다: {}", username);

        // 먼저 개인회원 테이블 검색
        return personalUserRepository.findByEmail(username)
                .<UserDetails>map(user -> {
                    log.info("[Auth] 개인 사용자를 찾았습니다: {}", username);
                    return new CustomUserDetails(user);
                })
                // 개인회원이 없으면 기업회원 테이블 검색
                .orElseGet(() -> {
                    log.info("[Auth] 개인 사용자를 찾지 못해 기업 사용자를 조회합니다: {}", username);
                    return companyUserRepository.findByLoginId(username)
                        .map(user -> {
                            log.info("[Auth] 기업 사용자를 찾았습니다: {}", username);
                            return (UserDetails) new CustomUserDetails(user);
                        })
                        .orElseThrow(() -> {
                            log.warn("[Auth] 사용자를 찾지 못했습니다: {}", username);
                            return new UsernameNotFoundException("User not found with username: " + username);
                        });
                });
    }
}
