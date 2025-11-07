package com.hirepicker.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.AcademicAbilityDto;
import com.hirepicker.dto.MilitaryServiceDto;
import com.hirepicker.dto.CertificationUpdateRequestDto;
import com.hirepicker.dto.AcademicAbilityViewDto;
import com.hirepicker.dto.WorkExperienceDto;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.MilitaryServiceRepository;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.WorkExperienceRepository;
import com.hirepicker.service.ProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "마이페이지", description = "개인회원 정보 편집 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final ProfileService profileService;
    private final WorkExperienceRepository workExperienceRepository;
    private final MilitaryServiceRepository militaryServiceRepository;
    private final PersonalUserRepository personalUserRepository;
    private final PasswordEncoder passwordEncoder;

    // --- 기본정보 저장 업데이트 (비밀번호 제외) ---
    @Operation(summary = "개인 기본정보 업데이트(비밀번호 제외)")
    @PatchMapping("/my-profile/details")
    @Transactional
    public ResponseEntity<Map<String, String>> updateDetails(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> req) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        PersonalUser user = personalUserRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "사용자를 찾을 수 없습니다."));

        String nickname = req.get("nickname");
        if (nickname != null && !nickname.trim().isEmpty()) {
            Optional<PersonalUser> existing = personalUserRepository.findByNickname(nickname.trim());
            if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "이미 사용 중인 닉네임입니다."));
            }
        }

        String encodedPwd = null;
        if (req.get("password") != null && !req.get("password").isBlank()) {
            encodedPwd = passwordEncoder.encode(req.get("password"));
        }

        profileService.updatePersonalUser(
                user.getId(),
                req.get("name"),
                req.get("gender"),
                req.get("phoneNumber"),
                req.get("address"),
                req.get("birthdate"), // 생년월일 추가(YYYY-MM-DD)
                encodedPwd,
                nickname
        );

        return ResponseEntity.ok(Map.of("message", "기본정보가 업데이트되었습니다."));
    }

    // --- 학력 ---
    @Operation(summary = "학력 조회")
    @GetMapping("/academics")
    public ResponseEntity<List<AcademicAbilityViewDto>> getAcademics(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        // 엔티티 PK 매핑 불일치 가능성 회피를 위해 JDBC 조회 사용
        var dtoList = profileService.listAcademics(userDetails.getId());
        return ResponseEntity.ok(dtoList);
    }

    @Operation(summary = "학력 저장(전체 교체)")
    @PutMapping("/academics")
    @Transactional
    public ResponseEntity<Map<String, String>> saveAcademics(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                            @RequestBody List<AcademicAbilityDto> academics) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        profileService.replaceAcademics(userDetails.getId(), academics);
        return ResponseEntity.ok(Map.of("message", "학력 정보가 저장되었습니다."));
    }

    // --- 경력 ---
    @Operation(summary = "경력 조회")
    @GetMapping("/experiences")
    public ResponseEntity<List<WorkExperienceDto>> getExperiences(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        var list = workExperienceRepository.findByPersonalUserIdOrderByHireDateDesc(userDetails.getId());
        var dtoList = list.stream().map(w -> new WorkExperienceDto(
                null,
                w.getCompanyName(),
                w.getDepartment(),
                w.getPosition(),
                w.getHireDate(),
                w.getResignDate(),
                w.getJobDescription(),
                w.getMainDuties()
        )).toList();
        return ResponseEntity.ok(dtoList);
    }

    @Operation(summary = "경력 저장(전체 교체)")
    @PutMapping("/experiences")
    @Transactional
    public ResponseEntity<Map<String, String>> saveExperiences(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                @RequestBody List<WorkExperienceDto> experiences) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        profileService.replaceExperiences(userDetails.getId(), experiences);
        return ResponseEntity.ok(Map.of("message", "경력 정보가 저장되었습니다."));
    }

    // --- 병역 ---
    @Operation(summary = "병역 조회")
    @GetMapping("/military")
    public ResponseEntity<MilitaryServiceDto> getMilitary(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        var opt = militaryServiceRepository.findTopByPersonalUserIdOrderByIdDesc(userDetails.getId());
        if (opt.isEmpty()) return ResponseEntity.ok(null);
        var m = opt.get();
        return ResponseEntity.ok(new MilitaryServiceDto(null, m.getServiceType(), m.getMilitaryBranch(), m.getMilitaryRank(), m.getPeriodOfService(), m.getReasonForExemption()));
    }

    @Operation(summary = "병역 저장/갱신")
    @PutMapping("/military")
    @Transactional
    public ResponseEntity<Map<String, String>> saveMilitary(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                            @RequestBody MilitaryServiceDto military) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        profileService.upsertMilitary(userDetails.getId(), military);
        return ResponseEntity.ok(Map.of("message", "병역 정보가 저장되었습니다."));
    }

    // --- 자격증(이력서-자격증 매핑) ---
    @Operation(summary = "자격증 매핑(전체 교체)")
    @PutMapping("/certifications")
    @Transactional
    public ResponseEntity<Map<String, String>> saveCertifications(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                @RequestBody CertificationUpdateRequestDto req) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        profileService.replaceResumeCertifications(userDetails.getId(), req.getResumeIdx(), req.getCertIdxList(), req.getCertNameList());
        return ResponseEntity.ok(Map.of("message", "자격증 정보가 저장되었습니다."));
    }
}

