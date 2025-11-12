package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.JobApplicationRequest;
import com.hirepicker.dto.JobApplicationResponse;
import com.hirepicker.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/postings")
@RequiredArgsConstructor
@Tag(name = "채용 공고 지원", description = "채용 공고 지원 처리 API")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @Operation(summary = "채용 공고 지원", description = "선택한 이력서를 사용하여 채용 공고에 지원합니다.")
    @PostMapping("/{postingIdx}/apply")
    public ResponseEntity<JobApplicationResponse> applyToPosting(
            @PathVariable("postingIdx") Long postingIdx,
            @Valid @RequestBody JobApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(JobApplicationResponse.failure("로그인이 필요합니다."));
        }

        try {
            JobApplicationResponse response = jobApplicationService.apply(
                    postingIdx,
                    request.getResumeId(),
                    userDetails.getId(),
                    userDetails.getUserType());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(JobApplicationResponse.failure(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(JobApplicationResponse.failure(e.getMessage()));
        }
    }
}

