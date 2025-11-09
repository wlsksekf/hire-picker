package com.hirepicker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.CompanyalarmsResponseDto; // DTO 임포트 추가
import com.hirepicker.entity.Companyalarms;
import com.hirepicker.service.AuthService;
import com.hirepicker.service.CompanyalarmsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/company-alarms")
@RequiredArgsConstructor
public class CompanyalarmsController {
    private final CompanyalarmsService companyalarmsService;
    

    @PostMapping
    public ResponseEntity<?> addCompanyAlarm(@RequestBody Map<String, Long> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // 회사 알람 추가
        if (userDetails == null) {
            return new ResponseEntity<>("User not authenticated", HttpStatus.UNAUTHORIZED);
        }
        Long pUserIdx = userDetails.getId();
        Long companyIdx = payload.get("company_idx");
        if (pUserIdx == null || companyIdx == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            Companyalarms companyalarms = companyalarmsService.addCompanyAlarm(pUserIdx, companyIdx);
            // Companyalarms 엔티티를 DTO로 변환하여 반환
            CompanyalarmsResponseDto responseDto = new CompanyalarmsResponseDto(
                    companyalarms.getPersonalUserId().getId(), // PersonalUser의 id (p_user_idx)
                    companyalarms.getCompanyIdx().getCompanyIdx() // Company의 companyIdx
            );
            return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/companies/{companyIdx}") // 회사 알람 제거
    public ResponseEntity<Void> removeCompanyAlarm(@PathVariable Long companyIdx,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Long pUserIdx = userDetails.getId();
        try {
            companyalarmsService.removeCompanyAlarm(pUserIdx, companyIdx);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/me/ids") // 현재 인증된 사용자의 관심 기업 ID 목록 조회
    public ResponseEntity<List<Long>> getLikedCompanyIdsByPersonalUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Long pUserIdx = userDetails.getId();
        List<Long> likedCompanyIds = companyalarmsService.getLikedCompanyIdsByPersonalUser(pUserIdx);
        return new ResponseEntity<>(likedCompanyIds, HttpStatus.OK);
    }
}
