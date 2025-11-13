package com.hirepicker.service;

import com.hirepicker.entity.AdPosting;
import com.hirepicker.entity.AdPosting.AdStatus;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.payment.CompanyUserCredit;
import com.hirepicker.repository.AdPostingRepository;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.repository.payment.CompanyUserCreditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 광고 공고 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdPostingService {

    private final AdPostingRepository adPostingRepository;
    private final CompanyUserRepository companyUserRepository;
    private final CompanyUserCreditRepository companyUserCreditRepository;
    private final JobPostingRepository jobPostingRepository;

    private static final int AD_POSTING_COST = 10000; // 광고 공고 등록 비용

    /**
     * 광고 공고 등록 (기존 채용공고를 광고로 프로모션, 크레딧 차감)
     */
    @Transactional
    public AdPosting createAdPosting(Long companyUserId, Long postingIdx, LocalDateTime startDate, LocalDateTime endDate) {
        // 1. 회사회원 조회
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> new IllegalArgumentException("회사회원을 찾을 수 없습니다."));

        // 2. 채용공고 조회 및 소유권 확인
        JobPosting jobPosting = jobPostingRepository.findById(postingIdx)
                .orElseThrow(() -> new IllegalArgumentException("채용공고를 찾을 수 없습니다."));

        // 외부 공고(c_user_idx가 null)는 광고로 등록할 수 없음
        if (jobPosting.getCUserIdx() == null) {
            throw new IllegalArgumentException("외부 공고는 광고로 등록할 수 없습니다. 직접 등록한 공고만 가능합니다.");
        }

        if (!jobPosting.getCUserIdx().equals(companyUser.getId())) {
            throw new IllegalArgumentException("본인의 채용공고만 광고로 등록할 수 있습니다.");
        }

        // 3. 이미 광고로 등록되어 있는지 확인 (활성 상태)
        boolean alreadyAdvertised = adPostingRepository.existsByJobPostingAndStatusIn(
                jobPosting, List.of(AdStatus.PENDING, AdStatus.ACTIVE));
        
        if (alreadyAdvertised) {
            throw new IllegalArgumentException("이미 광고로 등록된 채용공고입니다.");
        }

        // 4. 크레딧 잔액 확인
        CompanyUserCredit credit = companyUserCreditRepository.findById(companyUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("크레딧 정보를 찾을 수 없습니다."));

        Long currentBalance = credit.getBalance();
        if (currentBalance < AD_POSTING_COST) {
            throw new IllegalArgumentException("크레딧이 부족합니다. 현재 잔액: " + currentBalance + ", 필요 크레딧: " + AD_POSTING_COST);
        }

        // 5. 광고 공고 저장
        AdPosting newAdPosting = AdPosting.builder()
                .companyUser(companyUser)
                .jobPosting(jobPosting)
                .startDate(startDate)
                .endDate(endDate)
                .status(AdStatus.ACTIVE) // 즉시 활성화 (관리자 승인 없이)
                .creditAmount(AD_POSTING_COST)
                .build();

        AdPosting savedAdPosting = adPostingRepository.save(newAdPosting);

        // 6. 크레딧 차감
        credit.setBalance(currentBalance - AD_POSTING_COST);
        credit.setUpdatedAt(LocalDateTime.now());
        companyUserCreditRepository.save(credit);

        log.info("[광고 공고] 등록 완료. 회사: {}, 공고: {}, 광고 ID: {}, 차감 크레딧: {}",
                companyUser.getCompany().getCompanyName(), jobPosting.getTitle(), savedAdPosting.getAdPostingId(), AD_POSTING_COST);

        return savedAdPosting;
    }

    /**
     * 현재 활성화된 광고 공고 목록 조회 (메인 페이지용)
     */
    public List<AdPosting> getActiveAdPostings() {
        return adPostingRepository.findActiveAds(AdStatus.ACTIVE, LocalDateTime.now());
    }

    /**
     * 광고 공고 상세 조회 (조회수 증가)
     */
    @Transactional
    public AdPosting getAdPostingById(Long adPostingId) {
        AdPosting adPosting = adPostingRepository.findById(adPostingId)
                .orElseThrow(() -> new IllegalArgumentException("광고 공고를 찾을 수 없습니다."));

        adPosting.incrementViewCount(); // 조회수 증가
        return adPosting;
    }

    /**
     * 광고 클릭 기록 (클릭수 증가)
     */
    @Transactional
    public void recordAdClick(Long adPostingId) {
        AdPosting adPosting = adPostingRepository.findById(adPostingId)
                .orElseThrow(() -> new IllegalArgumentException("광고 공고를 찾을 수 없습니다."));

        adPosting.incrementClickCount(); // 클릭수 증가
        log.debug("[광고 공고] 클릭 기록. 광고 ID: {}, 클릭수: {}", adPostingId, adPosting.getClickCount());
    }

    /**
     * 회사회원의 광고 공고 목록 조회
     */
    public Page<AdPosting> getMyAdPostings(Long companyUserId, Pageable pageable) {
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> new IllegalArgumentException("회사회원을 찾을 수 없습니다."));

        return adPostingRepository.findByCompanyUserOrderByCreatedAtDesc(companyUser, pageable);
    }

    /**
     * 광고 종료일 연장
     */
    @Transactional
    public AdPosting updateAdPosting(Long companyUserId, Long adPostingId, LocalDateTime endDate) {
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> new IllegalArgumentException("회사회원을 찾을 수 없습니다."));

        AdPosting adPosting = adPostingRepository.findById(adPostingId)
                .orElseThrow(() -> new IllegalArgumentException("광고 공고를 찾을 수 없습니다."));

        // 본인 광고인지 확인
        if (!adPosting.getCompanyUser().getId().equals(companyUser.getId())) {
            throw new IllegalArgumentException("본인의 광고만 수정할 수 있습니다.");
        }

        // 종료일 수정
        adPosting.updateEndDate(endDate);

        log.info("[광고 공고] 종료일 연장. 광고 ID: {}, 회사: {}, 새 종료일: {}", 
                adPostingId, companyUser.getCompany().getCompanyName(), endDate);
        return adPosting;
    }

    /**
     * 광고 공고 삭제
     */
    @Transactional
    public void deleteAdPosting(Long companyUserId, Long adPostingId) {
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> new IllegalArgumentException("회사회원을 찾을 수 없습니다."));

        AdPosting adPosting = adPostingRepository.findById(adPostingId)
                .orElseThrow(() -> new IllegalArgumentException("광고 공고를 찾을 수 없습니다."));

        // 본인 광고인지 확인
        if (!adPosting.getCompanyUser().getId().equals(companyUser.getId())) {
            throw new IllegalArgumentException("본인의 광고만 삭제할 수 있습니다.");
        }

        adPostingRepository.delete(adPosting);
        log.info("[광고 공고] 삭제 완료. 광고 ID: {}, 회사: {}", adPostingId, companyUser.getCompany().getCompanyName());
    }

    /**
     * 광고 상태 변경 (관리자용)
     */
    @Transactional
    public AdPosting updateAdStatus(Long adPostingId, AdStatus status) {
        AdPosting adPosting = adPostingRepository.findById(adPostingId)
                .orElseThrow(() -> new IllegalArgumentException("광고 공고를 찾을 수 없습니다."));

        adPosting.updateStatus(status);
        log.info("[광고 공고] 상태 변경. 광고 ID: {}, 상태: {}", adPostingId, status);
        return adPosting;
    }

    /**
     * 만료된 광고 자동 종료 (스케줄러)
     * 매일 자정에 실행
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void expireOldAds() {
        List<AdPosting> expiredAds = adPostingRepository.findExpiredAds(AdStatus.ACTIVE, LocalDateTime.now());

        for (AdPosting ad : expiredAds) {
            ad.updateStatus(AdStatus.EXPIRED);
            log.info("[광고 공고] 자동 종료. 광고 ID: {}, 종료일: {}", ad.getAdPostingId(), ad.getEndDate());
        }

        if (!expiredAds.isEmpty()) {
            log.info("[광고 공고] 총 {}개 광고 자동 종료 완료", expiredAds.size());
        }
    }

    /**
     * 관리자: 전체 광고 목록 조회
     */
    public Page<AdPosting> getAllAdPostings(Pageable pageable) {
        return adPostingRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * 관리자: 특정 상태의 광고 목록 조회
     */
    public Page<AdPosting> getAdPostingsByStatus(AdStatus status, Pageable pageable) {
        return adPostingRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }
}

