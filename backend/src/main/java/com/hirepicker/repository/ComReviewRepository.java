package com.hirepicker.repository;

import com.hirepicker.entity.ComReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ComReviewRepository extends JpaRepository<ComReview, Long> {
    @Query("SELECT cr FROM ComReview cr WHERE cr.companyIdx = :companyIdx AND cr.pUserIdx = :pUserIdx")
    Optional<ComReview> findByCompanyIdxAndPUserIdx(@Param("companyIdx") Long companyIdx, @Param("pUserIdx") Long pUserIdx);
}
