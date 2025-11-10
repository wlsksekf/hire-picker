package com.hirepicker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.dto.JobDto;
import com.hirepicker.service.EmploymentData;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "채용 공고 API", description = "채용 공고 정보 관련 API")
@RestController
@RequestMapping("/api/job-postings")
@RequiredArgsConstructor
public class JobPostingController {

    private final EmploymentData employmentData;

    @Operation(summary = "테스트 엔드포인트", description = "컨트롤러 작동 여부 확인용 테스트 엔드포인트입니다.")
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("JobPostingController is working!");
    }

    @Operation(summary = "특정 채용 공고 상세 정보 조회", description = "postingId를 이용하여 특정 채용 공고의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobPostingById(@PathVariable("id") String id) {
        try {
            JobDto jobPosting = employmentData.getJobPostingById(id);
            return ResponseEntity.ok(jobPosting);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

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
}
