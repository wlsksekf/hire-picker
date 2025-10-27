package com.hirepicker.service;

import com.hirepicker.config.jwt.JwtTokenProvider;
import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.CompanySignupRequestDto;
import com.hirepicker.dto.LoginRequest;
import com.hirepicker.dto.LoginResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PersonalUserRepository personalUserRepository;
    private final CompanyUserRepository companyUserRepository;
    private final CompanyRepository companyRepository; // ★ 회사 리포지토리 주입
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder; // ★ 비밀번호 암호화기 주입

    @Transactional
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());
        try {
            // 1. 사용자 인증
            log.info("Step 1: Authenticating user...");
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("Step 1: Authentication successful.");

            // 인증된 사용자 정보 가져오기
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            UserType userType = userDetails.getUserType();
            Long userId = userDetails.getId();

            // 2. 토큰 생성
            log.info("Step 2: Creating tokens for user ID: {}, type: {}", userId, userType);
            String newRefreshTokenValue = jwtTokenProvider.createRefreshToken(authentication);
            String accessToken = jwtTokenProvider.createAccessToken(authentication);
            log.info("Step 2: Tokens created successfully.");

            // 3. 리프레시 토큰 처리
            log.info("Step 3: Processing refresh token...");
            if (userType == UserType.PERSONAL) {
                PersonalUser user = personalUserRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Personal user not found with ID: " + userId));
                handleRefreshToken(user, newRefreshTokenValue, userType);
            } else {
                CompanyUser user = companyUserRepository.findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Company user not found with ID: " + userId));
                handleRefreshToken(user, newRefreshTokenValue, userType);
            }

            // 5. 액세스 토큰과 리프레시 토큰 반환
            log.info("Step 5: Returning tokens.");
            return new LoginResponse(accessToken, newRefreshTokenValue);

        } catch (Throwable t) {
            log.error("!!! UNCAUGHT EXCEPTION IN LOGIN SERVICE !!!", t);
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
    public LoginResponse registerPersonalUser(SignupRequestDto signupRequest) {
        // 이중 체크: 이미 가입된 이메일인지 확인
        if (isEmailDuplicate(signupRequest.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
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
                .platform(signupRequest.getPlatform().name()) // ★ .name()으로 enum을 String으로 변환
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

        // 5. 토큰 반환
        return new LoginResponse(accessToken, refreshTokenValue);
    }

    /**
     * [신규] 기업 회원 가입 처리
     * @param request 회원가입 요청 DTO
     * @return 로그인 응답 (JWT 토큰 포함)
     */
    @Transactional
    public LoginResponse registerCompanyUser(CompanySignupRequestDto request) {
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

        return new LoginResponse(accessToken, refreshTokenValue);
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
}
