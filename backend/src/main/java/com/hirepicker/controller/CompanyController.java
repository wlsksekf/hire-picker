package com.hirepicker.controller;

import com.hirepicker.dto.CompanySearchResponseDto;
import com.hirepicker.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/search")
    public ResponseEntity<List<CompanySearchResponseDto>> searchCompanies(@RequestParam("name") String name) {
        return ResponseEntity.ok(companyService.searchByName(name));
    }
}
