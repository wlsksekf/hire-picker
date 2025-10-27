package com.hirepicker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.service.CompanyDataUpdateService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CompanyDataUpdateController {

    private final CompanyDataUpdateService companyDataUpdateService;

    @PostMapping("/api/companies/update-from-csv")
    public ResponseEntity<String> updateFromCsv() {
        try {
            int updated = companyDataUpdateService.updateCompanyDataFromCsv();
            String msg = String.format("Successfully updated %d companies", updated);
            log.info(msg);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            log.error("Failed to update companies from CSV", e);
            return ResponseEntity.internalServerError().body("Failed to update company data: " + e.getMessage());
        }
    }
}
