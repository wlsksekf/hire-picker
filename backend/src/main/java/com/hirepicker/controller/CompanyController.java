package com.hirepicker.controller;

import com.hirepicker.dto.CompanySearchResponseDto;
import com.hirepicker.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "기업", description = "기업 정보 관련 API")
@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @Operation(summary = "기업 검색", description = "이름으로 기업을 검색합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "기업 검색 성공")
    })
    @GetMapping("/search")
    public ResponseEntity<List<CompanySearchResponseDto>> searchCompanies(@Parameter(description = "검색할 기업 이름", required = true) @RequestParam("name") String name) {
        return ResponseEntity.ok(companyService.searchByName(name));
    }
}
