package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.UserDto;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.PersonalUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Slf4j 임포트 추가
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "사용자", description = "사용자 정보 관련 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j // Slf4j 어노테이션 추가
public class UserController {

    private final PersonalUserRepository personalUserRepository;

    @Operation(summary = "현재 로그인 사용자 정보 조회", description = "현재 로그인한 사용자의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "사용자 정보 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("Attempting to get current user info.");
        if (userDetails == null) {
            log.warn("AuthenticationPrincipal CustomUserDetails is null. User not authenticated.");
            return ResponseEntity.status(401).build(); // 인증되지 않은 사용자
        }

        try {
            String userEmail = userDetails.getUsername();
            log.info("Fetching user with email: {}", userEmail);
            PersonalUser personalUser = personalUserRepository.findByEmail(userEmail)
                    .orElse(null);

            if (personalUser == null) {
                log.warn("PersonalUser not found in DB for email: {}", userEmail);
                return ResponseEntity.status(404).build(); // 사용자를 찾을 수 없음
            }

            log.info("PersonalUser found: {}", personalUser.getEmail());
            // UserDto로 변환하여 반환합니다.
            UserDto userDto = new UserDto(personalUser.getEmail(), personalUser.getName(), personalUser.getPlatform());
            log.info("Returning UserDto for user: {}", userDto.getEmail());
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            log.error("Error while fetching or processing user info: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build(); // 서버 내부 오류
        }
    }
}
