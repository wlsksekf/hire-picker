package com.hirepicker.repository;

import com.hirepicker.entity.AdPosting;
import com.hirepicker.entity.AdPosting.AdStatus;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 광고 공고 Repository
 */
@Repository
public interface AdPostingRepository extends JpaRepository<AdPosting, Long> {

    /**
     * 현재 활성화된 광고 공고 조회 (기간 내 + ACTIVE 상태)
     * JOIN FETCH로 JobPosting과 Company를 Eager Fetch하여 Lazy Loading 문제 해결
     */
    @Query("SELECT a FROM AdPosting a " +
           "JOIN FETCH a.jobPosting jp " +
           "JOIN FETCH jp.company " +
           "WHERE a.status = :status " +
           "AND a.startDate <= :now AND a.endDate >= :now " +
           "ORDER BY a.createdAt DESC")
    List<AdPosting> findActiveAds(@Param("status") AdStatus status, @Param("now") LocalDateTime now);

    /**
     * 회사회원의 광고 공고 목록 조회
     */
    Page<AdPosting> findByCompanyUserOrderByCreatedAtDesc(CompanyUser companyUser, Pageable pageable);

    /**
     * 회사회원의 특정 상태 광고 공고 목록 조회
     */
    Page<AdPosting> findByCompanyUserAndStatusOrderByCreatedAtDesc(
            CompanyUser companyUser, AdStatus status, Pageable pageable);

    /**
     * 전체 광고 공고 목록 조회 (관리자용)
     */
    Page<AdPosting> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * 특정 상태의 광고 공고 목록 조회
     */
    Page<AdPosting> findByStatusOrderByCreatedAtDesc(AdStatus status, Pageable pageable);

    /**
     * 만료된 광고 찾기 (자동 종료용)
     */
    @Query("SELECT a FROM AdPosting a WHERE a.status = :status AND a.endDate < :now")
    List<AdPosting> findExpiredAds(@Param("status") AdStatus status, @Param("now") LocalDateTime now);

    /**
     * 특정 채용공고가 이미 광고로 등록되어 있는지 확인
     */
    boolean existsByJobPostingAndStatusIn(JobPosting jobPosting, List<AdStatus> statuses);
}

