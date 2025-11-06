package com.hirepicker.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.service.CompanyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/signup/company")
@RequiredArgsConstructor
public class CompanyUserController {

    private final CompanyService companyService;

    @PostMapping("/create-company")
    public ResponseEntity<?> createCompany(@RequestBody CompanyDto companyDto) {
        try {
            CompanyDto savedCompanyDto = companyService.createCompany(companyDto);
            // 성공 응답 반환
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedCompanyDto);
        } catch (Exception e) {
            // 예외 처리
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("기업 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<Boolean> checkDuplicate(@RequestParam String fieldName, @RequestParam String value) {
        boolean isDuplicate;
        if ("name".equalsIgnoreCase(fieldName)) {
            isDuplicate = companyService.isCompanyNameDuplicate(value);
        } else if ("businessNumber".equalsIgnoreCase(fieldName)) {
            isDuplicate = companyService.isBusinessNumberDuplicate(value);
        } else {
            // 지원하지 않는 필드명에 대한 에러 처리
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(isDuplicate);
    }
}