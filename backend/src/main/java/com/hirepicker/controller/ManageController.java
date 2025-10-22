package com.hirepicker.controller;

import io.swagger.v3.oas.annotations.Operation; // Added import
import io.swagger.v3.oas.annotations.tags.Tag;   // Added import
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Tag(name = "관리", description = "관리자 기능 관련 API") // Added Tag
@RestController
@RequestMapping("/api/manage")
@RequiredArgsConstructor
public class ManageController {
    
    private final ManageService mService;
    

    @Operation(summary = "학교 정보 업데이트", description = "외부 API를 통해 학교 정보를 업데이트합니다.") // Added Operation
    @GetMapping("/update/school")
    public ResponseEntity<String> updateSchool() {
        return mService.updateSchool();
    }
    
    @GetMapping("/schools")
    public ResponseEntity<?> getSchools() {
        return ResponseEntity.ok(mService.fetchSchoolData());
    }
}