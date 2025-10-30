package com.hirepicker.controller;


import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.UserProfileDto;
import com.hirepicker.entity.Gender;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.payment.PersonalUserCredit;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.payment.PersonalUserCreditRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@Tag(name = "사용자", description = "사용자 정보 및 회원가입 관련 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final PersonalUserRepository personalUserRepository;
    private final PersonalUserCreditRepository personalUserCreditRepository; // 크레딧 리포지토리 주입
    private final PasswordEncoder passwordEncoder;

    @Operation(summary = "내 프로필 정보 조회", description = "현재 로그인된 개인 회원의 프로필 정보를 조회합니다.")
    @GetMapping("/my-profile")
    public ResponseEntity<UserProfileDto> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return personalUserRepository.findById(userDetails.getId())
                .map(user -> ResponseEntity.ok(UserProfileDto.fromEntity(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
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


    @Operation(summary = "회원가입", description = "새로운 개인 회원을 등록합니다.")
    @PostMapping("/signup")
    @Transactional // 사용자 생성과 크레딧 생성을 하나의 트랜잭션으로 묶음
    public ResponseEntity<Map<String, String>> signup(@RequestBody Map<String, String> signupRequest) {
        log.info("[API] /api/users/signup 요청 수신. 사용자: {}", signupRequest.get("email"));
        String email = signupRequest.get("email");
        String password = signupRequest.get("password");
        String nickname = signupRequest.get("nickname"); // 닉네임 추가
        String name = signupRequest.get("name");         // 이름 추가
        String genderString = signupRequest.get("gender");     // 성별 String 값으로 받음

        if (email == null || password == null || nickname == null || name == null || genderString == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "이메일, 비밀번호, 닉네임, 이름, 성별은 필수입니다."));
        }

        Gender gender;
        try {
            gender = Gender.valueOf(genderString.toUpperCase()); // String을 Gender enum으로 변환
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "유효하지 않은 성별 값입니다."));
        }

        if (personalUserRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "이미 존재하는 이메일입니다."));
        }

        PersonalUser newUser = PersonalUser.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .nickname(nickname) // 닉네임 설정
                .name(name)         // 이름 설정
                .gender(gender)     // 성별 enum 값 설정
                // .isCancel(false)    // 기본값: 탈퇴 안 함 (PersonalUser 생성자에서 처리)
                .platform("LOCAL")  // 기본값: 로컬 가입 (String으로 설정)
                .build();

        personalUserRepository.save(newUser);

        // [수정] 회원가입 시 크레딧 정보 생성
        PersonalUserCredit newUserCredit = PersonalUserCredit.builder()
                .personalUser(newUser)
                .balance(0L) // 초기 크레딧 0으로 설정
                .build();
        personalUserCreditRepository.save(newUserCredit);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "회원가입 성공!"));
    }
}