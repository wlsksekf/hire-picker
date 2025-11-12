package com.hirepicker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.JobDto;
import com.hirepicker.entity.JobPostingStatus;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.JobPostingRepository;
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
    private final JobPostingRepository jobPostingRepository; // JobPostingRepository 주입

    @Operation(summary = "모든 채용 공고 목록 조회 (관리자용)", description = "모든 채용 공고 목록을 페이지네이션하여 조회합니다. 관리자만 접근 가능합니다.")
    @GetMapping("/all")
    public ResponseEntity<?> getAllJobPostings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 10, sort = "regDate") Pageable pageable) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        if (userDetails.getUserType() != UserType.MANAGE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자만 접근 가능합니다."));
        }

        Page<JobDto> jobPostings = employmentData.getJobs(pageable);
        return ResponseEntity.ok(jobPostings);
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

    @Operation(summary = "채용 공고 삭제 (관리자용)", description = "posting_idx를 이용하여 채용 공고를 삭제합니다. 관리자만 접근 가능합니다.")
    @DeleteMapping("/{postingIdx}")
    @Transactional
    public ResponseEntity<?> deleteJobPosting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("postingIdx") Long postingIdx) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        if (userDetails.getUserType() != UserType.MANAGE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자만 접근 가능합니다."));
        }

        if (!jobPostingRepository.existsById(postingIdx)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "해당 posting_idx의 채용 공고를 찾을 수 없습니다."));
        }

        jobPostingRepository.deleteById(postingIdx);
        return ResponseEntity.ok(Map.of("message", "채용 공고가 성공적으로 삭제되었습니다."));
    }

    @Operation(summary = "채용 공고 상태 변경 (관리자용)", description = "posting_idx를 이용하여 채용 공고의 상태를 CLOSED로 변경합니다. 관리자만 접근 가능합니다.")
    @PutMapping("/{postingIdx}/status")
    @Transactional
    public ResponseEntity<?> updateJobPostingStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("postingIdx") Long postingIdx) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }
        if (userDetails.getUserType() != UserType.MANAGE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "관리자만 접근 가능합니다."));
        }

        return jobPostingRepository.findById(postingIdx)
                .map(jobPosting -> {
                    jobPosting.setStatus(JobPostingStatus.CLOSED);
                    jobPostingRepository.save(jobPosting);
                    return ResponseEntity.ok(Map.of("message", "채용 공고 상태가 CLOSED로 변경되었습니다."));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "해당 posting_idx의 채용 공고를 찾을 수 없습니다.")));
    }
}
