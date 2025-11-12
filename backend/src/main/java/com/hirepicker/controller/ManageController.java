package com.hirepicker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.service.ManageService;
import com.hirepicker.service.AuthService;
import com.hirepicker.dto.PendingCompanyApprovalDto;
import com.hirepicker.dto.ManageLoginRequest;
import com.hirepicker.dto.ManageLoginResponse;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;


@Tag(name = "관리", description = "관리자 기능 관련 API")
@RestController
@RequestMapping("/api/manage")
@RequiredArgsConstructor
public class ManageController {

    private final ManageService mService;
    private final AuthService authService;

    @Operation(summary = "승인 대기 기업회원 목록", description = "is_approved가 PENDING인 기업회원 데이터를 반환합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "기업회원 목록 조회 성공")
    })
    @GetMapping("/company-users/pending")
    public ResponseEntity<List<PendingCompanyApprovalDto>> getPendingCompanyUsers() {
        // 관리자 대시보드에 승인 대기 기업을 전달
        List<PendingCompanyApprovalDto> pendingList = mService.getPendingCompanyApprovals();
        return ResponseEntity.ok(pendingList);
    }

    @Operation(summary = "기업회원 승인 처리", description = "승인 대기 상태(PENDING)의 기업회원을 APPROVED로 변경합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "기업회원 승인 완료"),
        @ApiResponse(responseCode = "400", description = "유효하지 않은 요청"),
        @ApiResponse(responseCode = "404", description = "대상 기업회원 없음")
    })
    @PostMapping("/company-users/{companyUserId}/approve")
    public ResponseEntity<Void> approveCompanyUser(@PathVariable("companyUserId") Long companyUserId) {
        mService.approveCompanyUser(companyUserId);
        return ResponseEntity.ok().build();
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
