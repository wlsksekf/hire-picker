package com.hirepicker.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.UserDto;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.PersonalUserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Slf4j 임포트 추가

@Tag(name = "사용자", description = "사용자 정보 관련 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j // Slf4j 어노테이션 추가
public class UserController {

    private final PasswordEncoder passwordEncoder;
    private final PersonalUserRepository personalUserRepository;
    private final CompanyUserRepository companyUserRepository;

    @Operation(summary = "현재 로그인 사용자 정보 조회", description = "현재 로그인한 사용자의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "사용자 정보 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    /**
     * 현재 로그인 사용자 정보 조회 (개인회원/기업회원 통합)
     *
     * 엔드포인트: GET /api/users/me
     * 인증: JWT 토큰 필요 (쿠키의 access_token)
     *
     * 역할:
     * - 프론트엔드에서 현재 로그인한 사용자의 정보를 가져올 때 사용
     * - 페이지 로드 시 인증 상태 확인 용도
     * - 마이페이지 메뉴 분기 처리를 위한 userType 제공
     *
     * 처리 흐름:
     * 1. JWT 필터에서 토큰을 파싱하여 CustomUserDetails 생성
     * 2. CustomUserDetails에서 userType과 userId 추출
     * 3. userType에 따라 해당 테이블에서 사용자 정보 조회
     * 4. UserDto로 변환하여 반환 (userType 포함)
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Attempting to get current user info.");

        // ===== STEP 1: 인증 확인 =====
        // JWT 필터가 토큰을 검증하고 CustomUserDetails를 주입
        // null이면 토큰이 없거나 유효하지 않은 경우
        if (userDetails == null) {
            log.warn("AuthenticationPrincipal CustomUserDetails is null. User not authenticated.");
            return ResponseEntity.status(401).build();
        }

        try {
            // ===== STEP 2: 사용자 타입과 ID 추출 =====
            // JWT 토큰에 저장된 정보 (JwtTokenProvider가 생성 시 포함시킴)
            UserType userType = userDetails.getUserType(); // PERSONAL 또는 COMPANY
            Long userId = userDetails.getId(); // 사용자 PK
            log.info("Fetching user info - ID: {}, Type: {}", userId, userType);

            // ===== STEP 3: userType에 따라 분기 처리 =====

            if (userType == UserType.PERSONAL) {
                // === 경로 A: 개인회원 처리 ===

                // 3-1. personal_user 테이블에서 사용자 조회
                PersonalUser personalUser = personalUserRepository.findById(userId)
                        .orElse(null);

                if (personalUser == null) {
                    log.warn("PersonalUser not found in DB for ID: {}", userId);
                    return ResponseEntity.status(404).build();
                }

                log.info("PersonalUser found: {}", personalUser.getEmail());

                // 3-2. PersonalUser 엔티티를 UserDto로 변환
                UserDto userDto = new UserDto(
                        personalUser.getId(), // 사용자 ID
                        personalUser.getEmail(), // 이메일
                        personalUser.getName(), // 이름
                        personalUser.getPlatform(), // OAuth2 제공자 (google, kakao 등)
                        personalUser.getNickname(), // 닉네임
                        UserType.PERSONAL // 회원 타입 (프론트에서 메뉴 분기용)
                );
                return ResponseEntity.ok(userDto);

            } else if (userType == UserType.COMPANY) {
                // === 경로 B: 기업회원 처리 ===

                // 3-1. company_user 테이블에서 사용자 조회
                CompanyUser companyUser = companyUserRepository.findById(userId)
                        .orElse(null);

                if (companyUser == null) {
                    log.warn("CompanyUser not found in DB for ID: {}", userId);
                    return ResponseEntity.status(404).build();
                }

                log.info("CompanyUser found: {}", companyUser.getEmail());

                // 3-2. CompanyUser 엔티티를 UserDto로 변환
                UserDto userDto = new UserDto(
                        companyUser.getId(), // 사용자 ID
                        companyUser.getEmail(), // 담당자 이메일
                        companyUser.getName(), // 담당자명
                        null, // 기업회원은 OAuth2 미지원
                        null, // 기업회원은 닉네임 없음
                        UserType.COMPANY // 회원 타입 (프론트에서 메뉴 분기용)
                );
                return ResponseEntity.ok(userDto);

            } else {
                // === 경로 C: 알 수 없는 타입 (에러) ===
                log.warn("Unknown UserType: {}", userType);
                return ResponseEntity.status(500).build();
            }

        } catch (Exception e) {
            log.error("Error while fetching or processing user info: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 내 프로필 정보 수정 (부분 수정)
     *
     * HTTP PATCH 메서드:
     * - PATCH는 리소스의 일부만 수정할 때 사용하는 HTTP 메서드입니다
     * - PUT과 달리 변경할 필드만 요청 본문에 포함하면 됩니다
     * - 예: { "nickname": "새닉네임" } 만 보내면 닉네임만 변경됩니다
     */
    @Operation(summary = "내 프로필 정보 수정", description = "현재 로그인된 개인 회원의 프로필 정보를 부분 수정합니다.")
    @PatchMapping("/my-profile")
    @Transactional
    public ResponseEntity<Map<String, String>> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> updateRequest) {

        // ===== 1단계: 인증 확인 =====
        // JWT 필터에서 자동으로 인증된 사용자 정보가 userDetails에 담겨 있음
        // 만약 null이면 인증 실패
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("[API] PATCH /api/users/my-profile 요청 수신. 사용자 ID: {}", userDetails.getId());

        // ===== 2단계: 사용자 정보 조회 =====
        // 토큰에서 추출한 사용자 ID로 DB에서 실제 사용자 정보를 가져옴
        PersonalUser user = personalUserRepository.findById(userDetails.getId())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "사용자를 찾을 수 없습니다."));
        }

        // ===== 3단계: 닉네임 업데이트 (선택적) =====
        // 프론트엔드에서 nickname을 보낸 경우에만 업데이트
        String nickname = updateRequest.get("nickname");
        if (nickname != null && !nickname.trim().isEmpty()) {
            // 3-1. 닉네임 중복 체크: 다른 사람이 이미 사용 중인지 확인
            Optional<PersonalUser> existingUser = personalUserRepository.findByNickname(nickname);
            if (existingUser.isPresent() && !user.getNickname().equals(nickname)) {
                // 이미 누군가 사용 중이고, 그게 본인이 아니면 중복 에러
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "이미 사용 중인 닉네임입니다."));
            }
            // 3-2. 중복이 아니면 닉네임 변경
            user.setNickname(nickname);
            log.info("[API] 닉네임 업데이트: {} -> {}", user.getNickname(), nickname);
        }

        // ===== 4단계: 비밀번호 업데이트 (선택적) =====
        // 프론트엔드에서 password를 보낸 경우에만 업데이트
        String password = updateRequest.get("password");
        if (password != null && !password.trim().isEmpty()) {
            // 비밀번호는 평문으로 저장하면 안 되므로 암호화 필수!
            user.setPassword(passwordEncoder.encode(password));
            log.info("[API] 비밀번호 업데이트 완료");
        }

        // ===== 5단계: 변경사항 DB에 저장 =====
        // @Transactional 어노테이션 덕분에 자동으로 커밋됨
        personalUserRepository.save(user);

        // ===== 6단계: 성공 응답 반환 =====
        return ResponseEntity.ok(Map.of("message", "프로필이 성공적으로 업데이트되었습니다."));
    }

}
