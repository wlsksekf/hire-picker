package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.AdPosting;
import com.hirepicker.entity.AdPosting.AdStatus;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.UserType;
import com.hirepicker.service.AdPostingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 광고 공고 컨트롤러
 */
@RestController
@RequestMapping("/api/ad-postings")
@RequiredArgsConstructor
@Slf4j
public class AdPostingController {

    private final AdPostingService adPostingService;

    /**
     * 광고 공고 등록 (기존 채용공고를 광고로 프로모션, 10000 크레딧 차감)
     */
    @PostMapping
    public ResponseEntity<?> createAdPosting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        try {
            // 인증 확인
            if (userDetails == null) {
                log.warn("[광고 공고] 인증되지 않은 사용자");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "로그인이 필요합니다."
                ));
            }

            // 회사회원 확인
            if (userDetails.getUserType() != UserType.COMPANY) {
                log.warn("[광고 공고] 개인회원이 광고 등록 시도. User ID: {}", userDetails.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "message", "기업회원만 접근 가능합니다."
                ));
            }

            Long companyUserId = userDetails.getId();
            Long postingIdx = Long.valueOf(request.get("postingIdx").toString());
            String startDateStr = (String) request.get("startDate");
            String endDateStr = (String) request.get("endDate");

            LocalDateTime startDate = LocalDateTime.parse(startDateStr);
            LocalDateTime endDate = LocalDateTime.parse(endDateStr);

            AdPosting createdAdPosting = adPostingService.createAdPosting(companyUserId, postingIdx, startDate, endDate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "광고가 등록되었습니다. 메인 페이지에 즉시 노출됩니다.");
            response.put("adPostingId", createdAdPosting.getAdPostingId());
            response.put("status", createdAdPosting.getStatus());
            response.put("startDate", createdAdPosting.getStartDate());
            response.put("endDate", createdAdPosting.getEndDate());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("[광고 공고] 등록 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 등록 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 공고 등록 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 현재 활성화된 광고 공고 목록 조회 (공개 API)
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveAdPostings() {
        try {
            List<AdPosting> activeAds = adPostingService.getActiveAdPostings();

            // DTO로 변환하여 Lazy Loading 문제 해결
            List<Map<String, Object>> adDtos = activeAds.stream().map(ad -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("adPostingId", ad.getAdPostingId());
                dto.put("status", ad.getStatus());
                dto.put("startDate", ad.getStartDate());
                dto.put("endDate", ad.getEndDate());
                dto.put("viewCount", ad.getViewCount());
                dto.put("clickCount", ad.getClickCount());

                // JobPosting 정보
                if (ad.getJobPosting() != null) {
                    JobPosting jp = ad.getJobPosting();
                    Map<String, Object> jobDto = new HashMap<>();
                    jobDto.put("postingIdx", jp.getPostingIdx());
                    jobDto.put("title", jp.getTitle());
                    jobDto.put("companyName", jp.getCompany() != null ?
                            jp.getCompany().getCompanyName() : null);
                    jobDto.put("location", jp.getLocation());
                    jobDto.put("imgUrl", jp.getImagePath());
                    // 채팅/지원 관련 필드
                    jobDto.put("internal", jp.getCUserIdx() != null);
                    jobDto.put("applyUrl", jp.getApplyUrl());
                    dto.put("jobPosting", jobDto);
                }

                return dto;
            }).toList();

            return ResponseEntity.ok(adDtos);
        } catch (Exception e) {
            log.error("[광고 공고] 활성 광고 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 공고 조회 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 광고 공고 상세 조회 (조회수 증가)
     */
    @GetMapping("/{adPostingId}")
    public ResponseEntity<?> getAdPostingById(@PathVariable Long adPostingId) {
        try {
            AdPosting adPosting = adPostingService.getAdPostingById(adPostingId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "adPosting", adPosting
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 상세 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 공고 조회 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 광고 클릭 기록 (클릭수 증가)
     */
    @PostMapping("/{adPostingId}/click")
    public ResponseEntity<?> recordAdClick(@PathVariable Long adPostingId) {
        try {
            adPostingService.recordAdClick(adPostingId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "클릭이 기록되었습니다."
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 클릭 기록 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "클릭 기록 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 내 광고 공고 목록 조회 (회사회원)
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMyAdPostings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            Pageable pageable) {
        try {
            if (userDetails == null || userDetails.getUserType() != UserType.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "message", "기업회원만 접근 가능합니다."
                ));
            }

            Long companyUserId = userDetails.getId();
            Page<AdPosting> myAds = adPostingService.getMyAdPostings(companyUserId, pageable);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "adPostings", myAds.getContent(),
                    "totalElements", myAds.getTotalElements(),
                    "totalPages", myAds.getTotalPages(),
                    "currentPage", myAds.getNumber()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 내 광고 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 공고 조회 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 광고 종료일 연장 (회사회원)
     */
    @PutMapping("/{adPostingId}")
    public ResponseEntity<?> updateAdPosting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long adPostingId,
            @RequestBody Map<String, String> request) {
        try {
            if (userDetails == null || userDetails.getUserType() != UserType.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "message", "기업회원만 접근 가능합니다."
                ));
            }

            Long companyUserId = userDetails.getId();
            String endDateStr = request.get("endDate");
            LocalDateTime endDate = LocalDateTime.parse(endDateStr);

            AdPosting updatedAdPosting = adPostingService.updateAdPosting(companyUserId, adPostingId, endDate);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "광고 종료일이 연장되었습니다.",
                    "adPosting", updatedAdPosting
            ));
        } catch (IllegalArgumentException e) {
            log.warn("[광고 공고] 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 수정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 수정 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 광고 공고 삭제 (회사회원)
     */
    @DeleteMapping("/{adPostingId}")
    public ResponseEntity<?> deleteAdPosting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long adPostingId) {
        try {
            if (userDetails == null || userDetails.getUserType() != UserType.COMPANY) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "message", "기업회원만 접근 가능합니다."
                ));
            }

            Long companyUserId = userDetails.getId();
            adPostingService.deleteAdPosting(companyUserId, adPostingId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "광고 공고가 삭제되었습니다."
            ));
        } catch (IllegalArgumentException e) {
            log.warn("[광고 공고] 삭제 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 공고 삭제 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 광고 상태 변경 (관리자용)
     */
    @PatchMapping("/{adPostingId}/status")
    public ResponseEntity<?> updateAdStatus(
            @PathVariable Long adPostingId,
            @RequestParam AdStatus status) {
        try {
            AdPosting updatedAdPosting = adPostingService.updateAdStatus(adPostingId, status);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "광고 상태가 변경되었습니다.",
                    "adPosting", updatedAdPosting
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 상태 변경 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "상태 변경 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 전체 광고 목록 조회 (관리자용)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllAdPostings(Pageable pageable) {
        try {
            Page<AdPosting> allAds = adPostingService.getAllAdPostings(pageable);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "adPostings", allAds.getContent(),
                    "totalElements", allAds.getTotalElements(),
                    "totalPages", allAds.getTotalPages(),
                    "currentPage", allAds.getNumber()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 전체 광고 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 공고 조회 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 특정 상태의 광고 목록 조회 (관리자용)
     */
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<?> getAdPostingsByStatus(
            @PathVariable AdStatus status,
            Pageable pageable) {
        try {
            Page<AdPosting> ads = adPostingService.getAdPostingsByStatus(status, pageable);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "adPostings", ads.getContent(),
                    "totalElements", ads.getTotalElements(),
                    "totalPages", ads.getTotalPages(),
                    "currentPage", ads.getNumber()
            ));
        } catch (Exception e) {
            log.error("[광고 공고] 상태별 광고 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "광고 공고 조회 중 오류가 발생했습니다."
            ));
        }
    }
}

