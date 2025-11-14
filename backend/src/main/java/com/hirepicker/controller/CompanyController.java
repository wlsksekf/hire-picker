package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.CompanyInfoDto;
import com.hirepicker.dto.CompanyUpdateDto;
import com.hirepicker.dto.JobPostingDto;
import com.hirepicker.dto.JobPostingUpdateDto;
import com.hirepicker.dto.JobPostingCreateDto;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.JobPostingStatus;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.repository.ApplicationsRepository;
import com.hirepicker.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.transaction.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * 회사 정보 관련 API 컨트롤러
 *
 * 주요 기능:
 * - 로그인한 기업회원의 회사 정보 조회
 */
@Tag(name = "회사", description = "회사 정보 관련 API")
@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
public class CompanyController {

    private final CompanyService companyService;
    private final CompanyUserRepository companyUserRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ApplicationsRepository applicationsRepository;

    /**
     * 내 회사 정보 조회
     *
     * 로그인한 기업회원의 회사 정보를 반환합니다.
     *
     * 인증 요구: 기업회원만 접근 가능
     * - JWT 필터에서 쿠키의 accessToken을 검증
     * - SecurityContext에 인증 정보 저장
     * - @AuthenticationPrincipal로 인증된 사용자 정보 주입
     *
     * @param userDetails 인증된 사용자 정보 (Spring Security가 자동 주입)
     * @return 200 OK + 회사 정보 DTO
     *         401 Unauthorized (인증되지 않음)
     *         403 Forbidden (개인회원이 접근)
     *         404 Not Found (회사 정보 없음)
     */
    @Operation(summary = "내 회사 정보 조회", description = "로그인한 기업회원의 회사 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "기업회원만 접근 가능"),
        @ApiResponse(responseCode = "404", description = "회사 정보 없음")
    })
    @GetMapping("/my")
    public ResponseEntity<?> getMyCompanyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // ===== STEP 1: 인증 확인 =====
        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 회사 정보 조회 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        // ===== STEP 2: 기업회원 여부 확인 =====
        if (userDetails.getUserType() != UserType.COMPANY) {
            log.warn("[API] 개인회원이 회사 정보 조회 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "기업회원만 접근 가능합니다."));
        }

        // ===== STEP 3: 회사 정보 조회 =====
        try {
            Long companyUserId = userDetails.getId();
            log.info("[API] 회사 정보 조회 요청. CompanyUser ID: {}", companyUserId);

            // CompanyService를 통해 회사 정보 조회 (DTO로 변환)
            CompanyInfoDto companyInfo = companyService.getCompanyByUserId(companyUserId);

            log.info("[API] 회사 정보 조회 성공. Company ID: {}", companyInfo.getCompanyIdx());
            return ResponseEntity.ok(companyInfo);

        } catch (IllegalStateException e) {
            // 회사 정보를 찾을 수 없는 경우
            log.error("[API] 회사 정보 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            // 예상치 못한 에러
            log.error("[API] 회사 정보 조회 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * 내 회사 정보 업데이트
     *
     * 로그인한 기업회원의 회사 정보를 수정합니다.
     *
     * HTTP PUT 메서드:
     * - PUT은 리소스 전체를 교체하는 HTTP 메서드입니다
     * - 요청 본문에 업데이트할 필드들을 포함합니다
     *
     * 인증 요구: 기업회원만 접근 가능
     *
     * @param userDetails 인증된 사용자 정보 (Spring Security가 자동 주입)
     * @param updateDto 업데이트할 회사 정보
     * @return 200 OK + 업데이트된 회사 정보 DTO
     *         401 Unauthorized (인증되지 않음)
     *         403 Forbidden (개인회원이 접근)
     *         404 Not Found (회사 정보 없음)
     */
    @Operation(summary = "내 회사 정보 업데이트", description = "로그인한 기업회원의 회사 정보를 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "업데이트 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "기업회원만 접근 가능"),
        @ApiResponse(responseCode = "404", description = "회사 정보 없음")
    })
    @PutMapping("/my")
    public ResponseEntity<?> updateMyCompanyInfo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CompanyUpdateDto updateDto) {

        // ===== STEP 1: 인증 확인 =====
        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 회사 정보 업데이트 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        // ===== STEP 2: 기업회원 여부 확인 =====
        if (userDetails.getUserType() != UserType.COMPANY) {
            log.warn("[API] 개인회원이 회사 정보 업데이트 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "기업회원만 접근 가능합니다."));
        }

        // ===== STEP 3: 회사 정보 업데이트 =====
        try {
            Long companyUserId = userDetails.getId();
            log.info("[API] 회사 정보 업데이트 요청. CompanyUser ID: {}", companyUserId);

            // CompanyService를 통해 회사 정보 업데이트
            CompanyInfoDto updatedCompanyInfo = companyService.updateCompanyInfo(companyUserId, updateDto);

            log.info("[API] 회사 정보 업데이트 성공. Company ID: {}", updatedCompanyInfo.getCompanyIdx());
            return ResponseEntity.ok(updatedCompanyInfo);

        } catch (IllegalStateException e) {
            // 회사 정보를 찾을 수 없는 경우
            log.error("[API] 회사 정보 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            // 예상치 못한 에러
            log.error("[API] 회사 정보 업데이트 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * 내 회사의 채용공고 목록 조회
     *
     * 로그인한 기업회원의 회사가 올린 모든 채용공고를 조회합니다.
     *
     * 인증 요구: 기업회원만 접근 가능
     *
     * @param userDetails 인증된 사용자 정보 (Spring Security가 자동 주입)
     * @return 200 OK + 채용공고 목록
     *         401 Unauthorized (인증되지 않음)
     *         403 Forbidden (개인회원이 접근)
     *         404 Not Found (회사 정보 없음)
     */
    @Operation(summary = "내 회사의 채용공고 목록 조회", description = "로그인한 기업회원의 회사가 올린 모든 채용공고를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "기업회원만 접근 가능"),
        @ApiResponse(responseCode = "404", description = "회사 정보 없음")
    })
    @GetMapping("/my/job-postings")
    public ResponseEntity<?> getMyJobPostings(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // ===== STEP 1: 인증 확인 =====
        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 채용공고 조회 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        // ===== STEP 2: 기업회원 여부 확인 =====
        if (userDetails.getUserType() != UserType.COMPANY) {
            log.warn("[API] 개인회원이 채용공고 조회 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "기업회원만 접근 가능합니다."));
        }

        // ===== STEP 3: 회사 정보 조회 =====
        try {
            Long companyUserId = userDetails.getId();
            log.info("[API] 채용공고 목록 조회 요청. CompanyUser ID: {}", companyUserId);

            // CompanyUser 조회
            CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                    .orElseThrow(() -> new IllegalStateException("사용자 정보를 찾을 수 없습니다."));

            // 연결된 Company 확인
            if (companyUser.getCompany() == null) {
                log.error("[API] CompanyUser에 연결된 Company가 없습니다. CompanyUser ID: {}", companyUserId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "회사 정보를 찾을 수 없습니다."));
            }

            Long companyIdx = companyUser.getCompany().getCompanyIdx();
            log.info("[API] Company ID: {}", companyIdx);

            // ===== STEP 4: 채용공고 목록 조회 (최신순) =====
            var jobPostings = jobPostingRepository.findByCompany_CompanyIdxOrderByRegDateDesc(companyIdx);

            // ===== STEP 5: 공고별 지원자 수 집계 =====
            var postingIdxList = jobPostings.stream()
                    .map(JobPosting::getPostingIdx)
                    .toList();

            var applicantCountMap = postingIdxList.isEmpty()
                    ? Map.<Long, Long>of()
                    : applicationsRepository.countByPostingIdxIn(postingIdxList).stream()
                            .collect(Collectors.toMap(
                                    ApplicationsRepository.PostingApplicationCountProjection::getPostingIdx,
                                    ApplicationsRepository.PostingApplicationCountProjection::getApplyCount));

            // Entity → DTO 변환 후 지원자 수 주입
            var jobPostingDtos = jobPostings.stream()
                    .map(jobPosting -> {
                        var dto = JobPostingDto.fromEntity(jobPosting);
                        long applyCount = applicantCountMap.getOrDefault(jobPosting.getPostingIdx(), 0L);
                        dto.setApplicantCount((int) applyCount); // 실제 지원자 수로 갱신
                        log.info("[API] postingIdx={}, applicantCount={}", jobPosting.getPostingIdx(), applyCount); // 공고별 지원자 수 확인 로그
                        return dto;
                    })
                    .toList();

            log.info("[API] 채용공고 목록 조회 성공. 공고 수: {}", jobPostingDtos.size());
            return ResponseEntity.ok(jobPostingDtos);

        } catch (IllegalStateException e) {
            log.error("[API] 채용공고 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("[API] 채용공고 조회 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * 채용공고 상세 조회
     *
     * @param userDetails 인증된 사용자 정보
     * @param postingIdx 채용공고 ID
     * @return 200 OK + 채용공고 상세 정보
     */
    @Operation(summary = "내 회사의 채용공고 상세 조회", description = "특정 채용공고의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "기업회원만 접근 가능 또는 다른 회사의 공고"),
        @ApiResponse(responseCode = "404", description = "채용공고 없음")
    })
    @GetMapping("/my/job-postings/{postingIdx}")
    public ResponseEntity<?> getJobPostingDetail(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("postingIdx") Long postingIdx) {

        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 채용공고 상세 조회 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        if (userDetails.getUserType() != UserType.COMPANY) {
            log.warn("[API] 개인회원이 채용공고 상세 조회 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "기업회원만 접근 가능합니다."));
        }

        try {
            Long companyUserId = userDetails.getId();
            log.info("[API] 채용공고 상세 조회 요청. CompanyUser ID: {}, Posting ID: {}", companyUserId, postingIdx);

            // 채용공고 조회
            JobPosting jobPosting = jobPostingRepository.findById(postingIdx)
                    .orElseThrow(() -> new IllegalStateException("채용공고를 찾을 수 없습니다."));

            // CompanyUser 조회
            CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                    .orElseThrow(() -> new IllegalStateException("사용자 정보를 찾을 수 없습니다."));

            // 권한 확인: 자신의 회사 공고인지 확인
            if (!jobPosting.getCompany().getCompanyIdx().equals(companyUser.getCompany().getCompanyIdx())) {
                log.warn("[API] 다른 회사의 채용공고 조회 시도. User Company: {}, Posting Company: {}",
                        companyUser.getCompany().getCompanyIdx(), jobPosting.getCompany().getCompanyIdx());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "다른 회사의 채용공고는 수정할 수 없습니다."));
            }

            // Entity → DTO 변환
            JobPostingDto jobPostingDto = JobPostingDto.fromEntity(jobPosting);

            log.info("[API] 채용공고 상세 조회 성공. Posting ID: {}", postingIdx);
            return ResponseEntity.ok(jobPostingDto);

        } catch (IllegalStateException e) {
            log.error("[API] 채용공고 상세 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("[API] 채용공고 상세 조회 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * 채용공고 수정
     *
     * @param userDetails 인증된 사용자 정보
     * @param postingIdx 채용공고 ID
     * @param updateDto 수정할 정보
     * @return 200 OK + 수정된 채용공고 정보
     */
    @Operation(summary = "내 회사의 채용공고 수정", description = "채용공고 정보를 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "기업회원만 접근 가능 또는 다른 회사의 공고"),
        @ApiResponse(responseCode = "404", description = "채용공고 없음")
    })
    @PutMapping("/my/job-postings/{postingIdx}")
    @Transactional
    public ResponseEntity<?> updateJobPosting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("postingIdx") Long postingIdx,
            @RequestBody JobPostingUpdateDto updateDto) {

        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 채용공고 수정 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        if (userDetails.getUserType() != UserType.COMPANY) {
            log.warn("[API] 개인회원이 채용공고 수정 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "기업회원만 접근 가능합니다."));
        }

        try {
            Long companyUserId = userDetails.getId();
            log.info("[API] 채용공고 수정 요청. CompanyUser ID: {}, Posting ID: {}", companyUserId, postingIdx);

            // 채용공고 조회
            JobPosting jobPosting = jobPostingRepository.findById(postingIdx)
                    .orElseThrow(() -> new IllegalStateException("채용공고를 찾을 수 없습니다."));

            // CompanyUser 조회
            CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                    .orElseThrow(() -> new IllegalStateException("사용자 정보를 찾을 수 없습니다."));

            // 권한 확인: 자신의 회사 공고인지 확인
            if (!jobPosting.getCompany().getCompanyIdx().equals(companyUser.getCompany().getCompanyIdx())) {
                log.warn("[API] 다른 회사의 채용공고 수정 시도. User Company: {}, Posting Company: {}",
                        companyUser.getCompany().getCompanyIdx(), jobPosting.getCompany().getCompanyIdx());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "다른 회사의 채용공고는 수정할 수 없습니다."));
            }

            // 필드별 업데이트 (null이 아닌 값만 업데이트)
            if (updateDto.getTitle() != null && !updateDto.getTitle().trim().isEmpty()) {
                jobPosting.setTitle(updateDto.getTitle());
            }
            if (updateDto.getEmploymentType() != null && !updateDto.getEmploymentType().trim().isEmpty()) {
                jobPosting.setEmploymentType(updateDto.getEmploymentType());
            }
            if (updateDto.getExperienceLevel() != null && !updateDto.getExperienceLevel().trim().isEmpty()) {
                jobPosting.setExperienceLevel(updateDto.getExperienceLevel());
            }
            if (updateDto.getSalaryInfo() != null) {
                jobPosting.setSalaryInfo(updateDto.getSalaryInfo());
            }
            if (updateDto.getLocation() != null && !updateDto.getLocation().trim().isEmpty()) {
                jobPosting.setLocation(updateDto.getLocation());
            }
            if (updateDto.getJobType() != null && !updateDto.getJobType().trim().isEmpty()) {
                jobPosting.setJobType(updateDto.getJobType());
            }
            if (updateDto.getHireCount() != null) {
                jobPosting.setHireCount(updateDto.getHireCount());
            }
            if (updateDto.getStartDate() != null) {
                jobPosting.setStartDate(updateDto.getStartDate());
            }
            if (updateDto.getEndDate() != null) {
                jobPosting.setEndDate(updateDto.getEndDate());
            }
            if (updateDto.getDescription() != null && !updateDto.getDescription().trim().isEmpty()) {
                jobPosting.setDescription(updateDto.getDescription());
            }
            if (updateDto.getRequiredQualifications() != null) {
                jobPosting.setRequiredQualifications(updateDto.getRequiredQualifications());
            }
            if (updateDto.getPreferredQualifications() != null) {
                jobPosting.setPreferredQualifications(updateDto.getPreferredQualifications());
            }
            if (updateDto.getWelfare() != null) {
                jobPosting.setWelfare(updateDto.getWelfare());
            }

            // 변경사항 저장 (@Transactional로 자동 커밋)
            JobPosting updatedPosting = jobPostingRepository.save(jobPosting);

            log.info("[API] 채용공고 수정 완료. Posting ID: {}", postingIdx);

            // Entity → DTO 변환하여 반환
            return ResponseEntity.ok(JobPostingDto.fromEntity(updatedPosting));

        } catch (IllegalStateException e) {
            log.error("[API] 채용공고 수정 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("[API] 채용공고 수정 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }

    /**
     * 채용공고 등록
     *
     * @param userDetails 인증된 사용자 정보
     * @param createDto 등록할 채용공고 정보
     * @return 201 Created + 생성된 채용공고 정보
     */
    @Operation(summary = "내 회사의 채용공고 등록", description = "새로운 채용공고를 등록합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "등록 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "기업회원만 접근 가능"),
        @ApiResponse(responseCode = "404", description = "회사 정보 없음")
    })
    @PostMapping("/my/job-postings")
    @Transactional
    public ResponseEntity<?> createJobPosting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody JobPostingCreateDto createDto) {

        if (userDetails == null) {
            log.warn("[API] 인증되지 않은 사용자의 채용공고 등록 시도");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "로그인이 필요합니다."));
        }

        if (userDetails.getUserType() != UserType.COMPANY) {
            log.warn("[API] 개인회원이 채용공고 등록 시도. User ID: {}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "기업회원만 접근 가능합니다."));
        }

        try {
            Long companyUserId = userDetails.getId();
            log.info("[API] 채용공고 등록 요청. CompanyUser ID: {}", companyUserId);

            // CompanyUser 조회
            CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                    .orElseThrow(() -> new IllegalStateException("사용자 정보를 찾을 수 없습니다."));

            // 연결된 Company 확인
            if (companyUser.getCompany() == null) {
                log.error("[API] CompanyUser에 연결된 Company가 없습니다. CompanyUser ID: {}", companyUserId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "회사 정보를 찾을 수 없습니다."));
            }

            // JobPosting 엔티티 생성
            JobPosting jobPosting = JobPosting.builder()
                    .company(companyUser.getCompany())
                    .cUserIdx(companyUserId)
                    .title(createDto.getTitle())
                    .employmentType(createDto.getEmploymentType())
                    .experienceLevel(createDto.getExperienceLevel())
                    .salaryInfo(createDto.getSalaryInfo())
                    .location(createDto.getLocation())
                    .jobType(createDto.getJobType())
                    .hireCount(createDto.getHireCount())
                    .startDate(createDto.getStartDate())
                    .endDate(createDto.getEndDate())
                    .description(createDto.getDescription())
                    .requiredQualifications(createDto.getRequiredQualifications())
                    .preferredQualifications(createDto.getPreferredQualifications())
                    .welfare(createDto.getWelfare())
                    .status(JobPostingStatus.OPEN) // 기본 상태: 진행중
                    .build();

            // DB에 저장
            JobPosting savedPosting = jobPostingRepository.save(jobPosting);

            log.info("[API] 채용공고 등록 완료. Posting ID: {}", savedPosting.getPostingIdx());

            // Entity → DTO 변환하여 반환
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(JobPostingDto.fromEntity(savedPosting));

        } catch (IllegalStateException e) {
            log.error("[API] 채용공고 등록 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("[API] 채용공고 등록 중 예외 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "서버 오류가 발생했습니다."));
        }
    }
}

