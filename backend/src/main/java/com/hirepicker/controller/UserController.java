package com.hirepicker.controller;


import com.hirepicker.entity.Gender;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.PersonalUserRepository;

import io.swagger.v3.oas.annotations.Operation; // Added import
import io.swagger.v3.oas.annotations.tags.Tag;   // Added import
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "사용자", description = "사용자 정보 및 회원가입 관련 API") // Added Tag
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final PersonalUserRepository personalUserRepository;
    private final PasswordEncoder passwordEncoder;


    @Operation(summary = "회원가입", description = "새로운 개인 회원을 등록합니다.") // Added Operation
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody Map<String, String> signupRequest) {
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

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "회원가입 성공!"));
    }
}