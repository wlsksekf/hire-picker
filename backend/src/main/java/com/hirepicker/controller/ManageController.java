package com.hirepicker.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.ManageLoginRequest;
import com.hirepicker.dto.ManageLoginResponse;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.EmpEventRepository;
import com.hirepicker.service.AuthService;
import com.hirepicker.service.EmploymentData;
import com.hirepicker.service.ManageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "관리", description = "관리자 기능 관련 API")
@RestController
@RequestMapping("/api/manage")
@RequiredArgsConstructor
@Slf4j
public class ManageController {

    private final ManageService mService;
    private final AuthService authService;
    private final EmploymentData employmentData; // EmploymentData 주입
    private final EmpEventRepository empEventRepository; // EmpEventRepository 주입

    @Operation(summary = "모든 채용 행사 목록 조회 (관리자용)", description = "모든 채용 행사 목록을 페이지네이션하여 조회합니다. 관리자만 접근 가능합니다.")
    @GetMapping("/emp-events")
    public ResponseEntity<?> getAllEmpEvents(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 10, sort = "eventIdx") Pageable pageable) {

        log.info("[API] getAllEmpEvents 호출됨. UserDetails: {}", userDetails);
        if (userDetails != null) {
            log.info("[API] UserDetails ID: {}, UserType: {}", userDetails.getId(), userDetails.getUserType());
        }

        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 채용 행사 조회 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        if (userDetails.getUserType() != UserType.MANAGE) {
            log.warn("[API] 관리자가 아닌 사용자의 채용 행사 조회 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자만 접근 가능합니다."));
        }

        Page<EventDto> empEvents = employmentData.getEvents(pageable);
        return ResponseEntity.ok(empEvents);
    }

    @Operation(summary = "채용 행사 삭제 (관리자용)", description = "event_idx를 이용하여 채용 행사를 삭제합니다. 관리자만 접근 가능합니다.")
    @DeleteMapping("/emp-events/{eventIdx}")
    @Transactional
    public ResponseEntity<?> deleteEmpEvent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("eventIdx") Long eventIdx) {

        log.info("[API] deleteEmpEvent 호출됨. UserDetails: {}", userDetails);
        if (userDetails != null) {
            log.info("[API] UserDetails ID: {}, UserType: {}", userDetails.getId(), userDetails.getUserType());
        }

        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 채용 행사 삭제 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        if (userDetails.getUserType() != UserType.MANAGE) {
            log.warn("[API] 관리자가 아닌 사용자의 채용 행사 삭제 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자만 접근 가능합니다."));
        }

        if (!empEventRepository.existsById(eventIdx)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "해당 event_idx의 채용 행사를 찾을 수 없습니다."));
        }

        empEventRepository.deleteById(eventIdx);
        return ResponseEntity.ok(Map.of("message", "채용 행사가 성공적으로 삭제되었습니다."));
    }

    @Operation(summary = "채용 행사 상태 변경 (관리자용)", description = "event_code를 이용하여 채용 행사의 상태를 CLOSED로 변경합니다. 관리자만 접근 가능합니다.")
    @PutMapping("/emp-events/{eventCode}/status")
    @Transactional
    public ResponseEntity<?> updateEmpEventStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("eventCode") String eventCode) {

        log.info("[API] updateEmpEventStatus 호출됨. UserDetails: {}", userDetails);
        if (userDetails != null) {
            log.info("[API] UserDetails ID: {}, UserType: {}", userDetails.getId(), userDetails.getUserType());
        }

        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 채용 행사 상태 변경 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        if (userDetails.getUserType() != UserType.MANAGE) {
            log.warn("[API] 관리자가 아닌 사용자의 채용 행사 상태 변경 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자만 접근 가능합니다."));
        }

        return empEventRepository.findByEventCode(eventCode)
                .map(empEvent -> {
                    empEvent.setEventStatus("CLOSED");
                    empEventRepository.save(empEvent);
                    return ResponseEntity.ok(Map.of("message", "채용 행사 상태가 CLOSED로 변경되었습니다."));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "해당 event_code의 채용 행사를 찾을 수 없습니다.")));
    }

    @Operation(summary = "학교 정보 업데이트", description = "외부 API를 통해 학교 정보를 업데이트합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "학교 정보 업데이트 성공")
    })
    @GetMapping("/update/school")
    public ResponseEntity<String> updateSchool() {
        return mService.updateSchool();
    }

    @Operation(summary = "학교 정보 조회", description = "DB에 저장된 학교 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "학교 정보 조회 성공")
    })
    @GetMapping("/schools")
    public ResponseEntity<?> getSchools() {
        return ResponseEntity.ok(mService.fetchSchoolData());
    }

    @Operation(summary = "자격증 정보 업데이트", description = "Q-Net API를 통해 자격증 정보를 업데이트합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "자격증 정보 업데이트 성공")
    })
    @GetMapping("/update/certification")
    public ResponseEntity<String> updateCertification() {
        return mService.updateCertification();
    }

    @Operation(summary = "RapidAPI 채용공고 수집", description = "활성 채용공고 API에서 최신 공고를 불러옵니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채용공고 수집 성공")
    })
    @PostMapping("/job-postings/import/rapid")
    public ResponseEntity<String> importRapidJobPostings() {
        return mService.importRapidApiJobPostings();
    }

    @Operation(summary = "JSearch 채용공고 수집", description = "JSearch API에서 최신 공고를 수집합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채용공고 수집 성공")
    })
    @PostMapping("/job-postings/import/jsearch")
    public ResponseEntity<String> importJSearchJobPostings() {
        return mService.importJSearchJobPostings();
    }

    @Operation(summary = "관리자 로그인", description = "관리자 계정으로 로그인하고 토큰을 발급합니다.")
    @PostMapping("/auth/login")
    public ResponseEntity<ManageLoginResponse> loginManage(@Valid @RequestBody ManageLoginRequest request,
            HttpServletResponse response) {
        ManageLoginResponse body = authService.loginManage(request, response);
        return ResponseEntity.ok(body);
    }
}
