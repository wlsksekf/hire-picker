package com.hirepicker.service;

import com.hirepicker.config.jwt.JwtTokenProvider;
import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.CompanySignupRequestDto;
import com.hirepicker.dto.LoginRequest;
import com.hirepicker.dto.SignupRequestDto;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.RefreshToken;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PersonalUserRepository personalUserRepository;
    private final CompanyUserRepository companyUserRepository;
    private final CompanyRepository companyRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    /**
     * 로그인 처리 (개인회원/기업회원 통합)
     *
     * 전체 흐름:
     * 0. UserType을 ThreadLocal에 설정
     * 1. 사용자 인증 (Spring Security)
     * 2. JWT 토큰 생성 (Access Token, Refresh Token)
     * 3. Refresh Token DB 저장
     * 4. HttpOnly 쿠키에 토큰 설정
     * 5. ThreadLocal 정리
     *
     * @param request 로그인 요청 정보 (email/아이디, password, userType)
     * @param response HTTP 응답 (쿠키 설정용)
     */
    @Transactional
    public void login(LoginRequest request, HttpServletResponse response) {
        log.info("Login attempt for user: {}, type: {}", request.getEmail(), request.getUserType());
        try {
            // ========== STEP 0: UserType 설정 ==========
            // UserDetailsService가 userType에 따라 효율적으로 검색할 수 있도록
            // ThreadLocal을 통해 userType 전달
            UserDetailsServiceImpl.setUserType(request.getUserType());

            try {
                // ========== STEP 1: 사용자 인증 ==========
                log.info("Step 1: Authenticating user...");

                // 1-1. 인증 토큰 생성 (username, password)
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());

                // 1-2. AuthenticationManager를 통한 인증 실행
                // 내부적으로 UserDetailsService.loadUserByUsername() 호출
                // → CustomAuthenticationProvider에서 비밀번호 검증
                Authentication authentication = authenticationManager.authenticate(authenticationToken);

                // 1-3. SecurityContext에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("Step 1: Authentication successful.");

                // ========== 인증된 사용자 정보 추출 ==========
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                UserType userType = userDetails.getUserType();  // PERSONAL 또는 COMPANY
                Long userId = userDetails.getId();              // 사용자 PK

                // ========== STEP 2: JWT 토큰 생성 ==========
                log.info("Step 2: Creating tokens for user ID: {}, type: {}", userId, userType);

                // 2-1. Refresh Token 생성 (만료 기간: 7일)
                String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);

                // 2-2. Access Token 생성 (만료 기간: 30분)
                String accessToken = jwtTokenProvider.createAccessToken(authentication);
                log.info("Step 2: Tokens created successfully.");

                // ========== STEP 3: Refresh Token DB 저장 ==========
                log.info("Step 3: Processing refresh token...");

                // userType에 따라 해당 사용자 엔티티를 가져와서 Refresh Token 저장
                if (userType == UserType.PERSONAL) {
                    // 개인회원의 경우
                    PersonalUser user = personalUserRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("Personal user not found with ID: " + userId));
                    handleRefreshToken(user, newRefreshTokenValue, userType);
                } else {
                    // 기업회원의 경우
                    CompanyUser user = companyUserRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("Company user not found with ID: " + userId));
                    handleRefreshToken(user, newRefreshTokenValue, userType);
                }

                // ========== STEP 4: 토큰을 HttpOnly 쿠키에 저장 ==========
                log.info("Step 4: Adding tokens to cookie.");
                // XSS 공격 방지를 위해 HttpOnly 쿠키로 전송
                // - access_token: 30분 만료
                // - refresh_token: 7일 만료
                addTokensToCookie(response, accessToken, newRefreshTokenValue);

            } finally {
                // ========== STEP 5: ThreadLocal 정리 (필수) ==========
                // 메모리 누수 방지를 위해 반드시 정리
                // ThreadPool 환경에서 스레드 재사용 시 이전 값이 남아있을 수 있음
                UserDetailsServiceImpl.clearUserType();
            }

        } catch (Throwable t) {
            log.error("!!! UNCAUGHT EXCEPTION IN LOGIN SERVICE !!!", t);
            // 예외 발생 시에도 ThreadLocal 정리 (메모리 누수 방지)
            UserDetailsServiceImpl.clearUserType();
            throw t;
        }
    }

    /**
     * [신규] 이메일 중복 확인
     * @param email 확인할 이메일
     * @return 중복 여부 (true: 중복, false: 사용 가능)
     */
    @Transactional(readOnly = true)
    public boolean isEmailDuplicate(String email) {
        return personalUserRepository.existsByEmail(email) || companyUserRepository.existsByEmail(email);
    }

    /**
     * [신규] 개인 회원 가입 처리
     * @param signupRequest 회원가입 요청 DTO
     * @return 로그인 응답 (JWT 토큰 포함)
     */
    @Transactional
    public void registerPersonalUser(SignupRequestDto signupRequest, HttpServletResponse response) {
        // 이중 체크: 이미 가입된 이메일인지 확인
        if (isEmailDuplicate(signupRequest.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // 닉네임 중복 확인
        if (personalUserRepository.existsByNickname(signupRequest.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // 비밀번호와 비밀번호 확인이 일치하는지 검증
        if (!signupRequest.getPassword().equals(signupRequest.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 1. PersonalUser 엔티티 생성 및 저장
        PersonalUser newUser = PersonalUser.builder()
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .name(signupRequest.getName())
                .nickname(signupRequest.getNickname())
                .gender(signupRequest.getGender())
                .phoneNumber(signupRequest.getPhone_number())
                .address(signupRequest.getAddress())
                .platform(signupRequest.getPlatform().name())
                .build();

        PersonalUser savedUser = personalUserRepository.save(newUser);
        log.info("새로운 개인 회원이 등록되었습니다. ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());

        // 2. 가입된 정보로 Authentication 객체 생성
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);

        // 4. 리프레시 토큰 저장
        handleRefreshToken(savedUser, refreshTokenValue, UserType.PERSONAL);

        // 5. 토큰을 쿠키에 저장
        addTokensToCookie(response, accessToken, refreshTokenValue);
    }

    /**
     * 기업 회원 가입 처리
     * @param request 회원가입 요청 DTO
     * @return 로그인 응답 (JWT 토큰 포함)
     */
    @Transactional
    public void registerCompanyUser(CompanySignupRequestDto request, HttpServletResponse response) {
        if (companyUserRepository.existsByLoginId(request.getId())) {
            throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
        }
        if (isEmailDuplicate(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        Company company = companyRepository.findById(request.getCompanyIdx())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회사입니다."));

        CompanyUser newUser = CompanyUser.builder()
                .loginId(request.getId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhone_number())
                .company(company)
                .build();

        CompanyUser savedUser = companyUserRepository.save(newUser);
        log.info("새로운 기업 회원이 등록되었습니다. ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);

        handleRefreshToken(savedUser, refreshTokenValue, UserType.COMPANY);

        addTokensToCookie(response, accessToken, refreshTokenValue);
    }

    // 리프레시 토큰 처리 로직을 별도 메서드로 분리 (PersonalUser, CompanyUser 공용)
    private void handleRefreshToken(Object user, String newRefreshTokenValue, UserType userType) {
        RefreshToken refreshToken = null;
        boolean isNewUser = false;

        if (user instanceof PersonalUser pUser) {
            refreshToken = pUser.getRefreshToken();
            if (refreshToken == null) isNewUser = true;
        } else if (user instanceof CompanyUser cUser) {
            refreshToken = cUser.getRefreshToken();
            if (refreshToken == null) isNewUser = true;
        }

        if (isNewUser) {
            log.info("Scenario A: First-time login for user.");
            RefreshToken newRefreshToken = RefreshToken.builder()
                    .token(newRefreshTokenValue)
                    .userType(userType)
                    .build();
            RefreshToken savedToken = refreshTokenRepository.save(newRefreshToken);

            if (user instanceof PersonalUser pUser) {
                pUser.setRefreshToken(savedToken);
                personalUserRepository.save(pUser);
            } else if (user instanceof CompanyUser cUser) {
                cUser.setRefreshToken(savedToken);
                companyUserRepository.save(cUser);
            }
            log.info("New RefreshToken saved and user updated.");
        } else {
            // ★ Potential NPE 경고 해결을 위한 null 체크 추가
            if (refreshToken != null) {
                log.info("Scenario B: Re-login for user.");
                refreshToken.updateTokenValue(newRefreshTokenValue);
                refreshTokenRepository.save(refreshToken);
                log.info("Existing refresh token updated.");
            }
        }
    }

    // HttpOnly, SameSite, Secure 속성을 적용하여 쿠키를 추가하는 헬퍼 메서드
    public void addTokensToCookie(HttpServletResponse response, String accessToken, String refreshToken) {
        // 현재 활성 프로필을 확인하여 secure 속성 동적 설정
        boolean isProduction = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(isProduction) // ★ 환경에 따라 동적으로 설정
                .path("/")
                .maxAge(jwtTokenProvider.getAccessTokenValidityInMilliseconds() / 1000)
                .sameSite("Strict") // CSRF 방어를 위해 Strict 설정
                .build();
        response.addHeader("Set-Cookie", accessTokenCookie.toString());

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(isProduction) // 환경에 따라 동적으로 설정
                .path("/")
                .maxAge(jwtTokenProvider.getRefreshTokenValidityInMilliseconds() / 1000)
                .sameSite("Strict") // CSRF 방어를 위해 Strict 설정
                .build();
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());
    }

    /**
     * 리프레시 토큰을 이용한 액세스 토큰 갱신
     * @param request HttpServletRequest (리프레시 토큰 쿠키 추출)
     * @param response HttpServletResponse (새로운 토큰 쿠키 설정)
     */
    @Transactional
    public void refreshToken(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            throw new IllegalArgumentException("리프레시 토큰이 없습니다.");
        }

        // 1. 리프레시 토큰 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 리프레시 토큰입니다.");
        }

        // 2. 리프레시 토큰에서 인증 정보 가져오기
        Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. 새로운 액세스 토큰 및 리프레시 토큰 생성
        String newAccessToken = jwtTokenProvider.createAccessToken(authentication);
        String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);

        // 4. DB에 저장된 리프레시 토큰 업데이트
        RefreshToken storedRefreshToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("저장된 리프레시 토큰을 찾을 수 없습니다."));

        storedRefreshToken.updateTokenValue(newRefreshTokenValue);
        refreshTokenRepository.save(storedRefreshToken);

        // 5. 새로운 토큰들을 쿠키에 추가
        addTokensToCookie(response, newAccessToken, newRefreshTokenValue);
    }

    /**
     * 로그아웃 처리: JWT 토큰 쿠키 삭제 및 SecurityContext 초기화
     * @param response HttpServletResponse (쿠키 삭제)
     */
    public void logout(HttpServletResponse response) {
        // 1. SecurityContextHolder 초기화
        SecurityContextHolder.clearContext();
        log.info("SecurityContextHolder가 초기화되었습니다.");

        // 2. ResponseCookie를 사용하여 쿠키 삭제
        boolean isProduction = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(isProduction) // 환경에 따라 동적으로 설정
                .path("/")
                .maxAge(0) // 쿠키 즉시 만료
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", accessTokenCookie.toString());
        log.info("Access Token 쿠키가 삭제되었습니다.");

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isProduction) // 환경에 따라 동적으로 설정
                .path("/")
                .maxAge(0) // 쿠키 즉시 만료
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());
        log.info("Refresh Token 쿠키가 삭제되었습니다.");
    }
}
