package com.hirepicker.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.service.ManageService;


@Tag(name = "관리", description = "관리자 기능 관련 API")
@RestController
@RequestMapping("/api/manage")
@RequiredArgsConstructor
public class ManageController {
    
    private final ManageService mService;
    

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
}