package com.hirepicker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.JobPosting;

import java.util.Optional;

@Repository // Spring의 리포지토리 빈으로 등록
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    // 공고 ID로 채용 공고를 찾는 메서드
    Optional<JobPosting> findByPostingId(String postingId);
}