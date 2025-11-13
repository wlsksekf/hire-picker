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
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List; // List 추가

@Tag(name = "채용 공고", description = "채용 공고 정보 조회 API")
@RestController
@RequestMapping("/api/job-postings")
@RequiredArgsConstructor
public class JobPostingController {

    private final EmploymentData employmentData;

    @Operation(summary = "특정 채용 공고 상세 정보 조회", description = "posting_idx를 이용하여 특정 채용 공고의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "공고를 찾을 수 없음")
    })
    @GetMapping("/idx/{posting_idx}")
    public ResponseEntity<JobDto> getJobPostingByPostingIdx(
            @Parameter(description = "채용 공고 인덱스", required = true) @PathVariable("posting_idx") Long posting_idx) {
        try {
            JobDto jobPosting = employmentData.getJobPostingByPostingIdx(posting_idx);
            return ResponseEntity.ok(jobPosting);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "관심 기업의 채용 공고 목록 조회", description = "관심 기업 ID 목록을 이용하여 해당 기업들의 채용 공고 목록을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "기업을 찾을 수 없음")
    })
    @GetMapping("/by-companies")
    public ResponseEntity<List<JobDto>> getJobPostingsByCompanyIds(
            @Parameter(description = "기업 ID 목록", required = true) @RequestParam("companyIds") List<Long> companyIds) {
        try {
            List<JobDto> jobPostings = employmentData.getJobPostingsByCompanyIds(companyIds);
            return ResponseEntity.ok(jobPostings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
