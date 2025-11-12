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
import com.hirepicker.dto.ReviewResponseDto;
import com.hirepicker.entity.ComReview;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final PersonalUserRepository personalUserRepository;

    @GetMapping("/companies/{companyId}") // 기업 상세보기에 리뷰들 가져오기
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByCompany(@PathVariable Long companyId) {
        List<ReviewResponseDto> reviews = reviewService.getReviewsByCompany(companyId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/companies") // 사용자가 리뷰 작성 가능한 회사들 가져오기
    public ResponseEntity<List<CompanyReviewDto>> getReviewableCompanies(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getId();
        List<CompanyReviewDto> reviewableCompanies = reviewService.getReviewableCompanies(userId);
        return ResponseEntity.ok(reviewableCompanies);
    }

    @GetMapping("/{companyId}/my-review") // 사용자가 특정 회사에 작성한 리뷰 가져오기
    public ResponseEntity<ReviewRequest> getMyReview(
            @PathVariable Long companyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 1. 로그인 여부 확인
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 사용자 조회 (없으면 404)
        Optional<PersonalUser> optionalUser = personalUserRepository.findById(userDetails.getId());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PersonalUser user = optionalUser.get();

        // 3. 리뷰 조회
        Optional<ComReview> optionalReview = reviewService.getMyReview(companyId, user);
        if (optionalReview.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // 4. DTO 변환 후 반환
        ComReview review = optionalReview.get();
        ReviewRequest dto = new ReviewRequest();
        dto.setReviewIdx(review.getReviewIdx());
        dto.setReview(review.getContent());
        dto.setReviewerType(review.getReviewerType());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{companyId}") // 리뷰 작성 및 수정
    public ResponseEntity<Void> saveReview(
            @PathVariable Long companyId,
            @RequestBody ReviewRequest reviewRequest,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 1. 로그인 확인
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. 사용자 조회
        Long userId = userDetails.getId();
        Optional<PersonalUser> optionalUser = personalUserRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PersonalUser personalUser = optionalUser.get();

        // 3. 리뷰 저장
        reviewService.saveReview(
                companyId,
                reviewRequest.getReview(),
                reviewRequest.getReviewerType(),
                personalUser,
                reviewRequest.getReviewIdx());

        // 4. 성공 응답
        return ResponseEntity.ok().build();
    }
}
