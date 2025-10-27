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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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