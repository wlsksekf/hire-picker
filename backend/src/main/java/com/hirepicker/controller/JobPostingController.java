package com.hirepicker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam; // RequestParam 추가
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.dto.JobDto;
import com.hirepicker.service.EmploymentData;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List; // List 추가

@Tag(name = "채용 공고 API", description = "채용 공고 정보 관련 API")
@RestController
@RequestMapping("/api/job-postings")
@RequiredArgsConstructor
public class JobPostingController {

    private final EmploymentData employmentData;

    @Operation(summary = "특정 채용 공고 상세 정보 조회 (인덱스 기준)", description = "posting_idx를 이용하여 특정 채용 공고의 상세 정보를 조회합니다.")
    @GetMapping("/idx/{posting_idx}") // Changed path to avoid conflict with /id
    public ResponseEntity<JobDto> getJobPostingByPostingIdx(@PathVariable("posting_idx") Long posting_idx) {
        try {
            JobDto jobPosting = employmentData.getJobPostingByPostingIdx(posting_idx);
            return ResponseEntity.ok(jobPosting);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "관심 기업의 채용 공고 목록 조회", description = "관심 기업 ID 목록을 이용하여 해당 기업들의 채용 공고 목록을 조회합니다.")
    @GetMapping("/by-companies")
    public ResponseEntity<List<JobDto>> getJobPostingsByCompanyIds(
            @RequestParam("companyIds") List<Long> companyIds) {
        try {
            List<JobDto> jobPostings = employmentData.getJobPostingsByCompanyIds(companyIds);
            return ResponseEntity.ok(jobPostings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
