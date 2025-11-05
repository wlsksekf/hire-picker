package com.hirepicker.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.CompanyReviewDto;
import com.hirepicker.dto.ReviewRequest;
import com.hirepicker.entity.ComReview;
import com.hirepicker.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyReviewDto>> getReviewableCompanies(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getId();
        List<CompanyReviewDto> reviewableCompanies = reviewService.getReviewableCompanies(userId);
        return ResponseEntity.ok(reviewableCompanies);
    }

    @GetMapping("/{companyId}/my-review")
    public ResponseEntity<ReviewRequest> getMyReview(
            @PathVariable Long companyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long pUserIdx = userDetails.getId();
        Optional<ComReview> myReview = reviewService.getMyReview(companyId, pUserIdx);

        return myReview.map(review -> {
            ReviewRequest reviewRequest = new ReviewRequest();
            reviewRequest.setReviewIdx(review.getReviewIdx());
            reviewRequest.setReview(review.getContent());
            reviewRequest.setReviewerType(review.getReviewerType());
            reviewRequest.setPUserIdx(review.getPUserIdx()); // Not strictly needed for frontend, but good for
                                                             // consistency
            return ResponseEntity.ok(reviewRequest);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{companyId}")
    public ResponseEntity<Void> saveReview(
            @PathVariable Long companyId,
            @RequestBody ReviewRequest reviewRequest,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long pUserIdx = userDetails.getId();

        reviewService.saveReview(
                companyId,
                reviewRequest.getReview(),
                reviewRequest.getReviewerType(),
                pUserIdx,
                reviewRequest.getReviewIdx());
        return ResponseEntity.ok().build();
    }
}
