package com.hirepicker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.service.ManageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/work24")
@RequiredArgsConstructor
@Slf4j
public class JobImportController {

    private final ManageService manageService;

    @PostMapping("/sync/rapid-jobs")
    public ResponseEntity<String> syncRapidJobs() {
        log.info("Public RapidAPI job import requested.");
        return manageService.importRapidApiJobPostings();
    }

    @PostMapping("/sync/jsearch-jobs")
    // JSearch 채용공고를 공개 경로로 불러오는 엔드포인트
    public ResponseEntity<String> syncJSearchJobs() {
        log.info("Public JSearch job import requested.");
        return manageService.importJSearchJobPostings();
    }
}

