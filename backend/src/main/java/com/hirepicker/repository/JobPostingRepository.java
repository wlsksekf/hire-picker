package com.hirepicker.repository;

import com.hirepicker.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Spring의 리포지토리 빈으로 등록
public interface JobPostingRepository extends JpaRepository<JobPosting, Long>,JpaSpecificationExecutor<JobPosting> {
    // 공고 ID로 채용 공고를 찾는 메서드
    Optional<JobPosting> findByPostingId(String postingId);

    // N+1 문제 해결을 위해 @EntityGraph 사용 (company 엔티티를 함께 fetch)
    @Override
    @EntityGraph(attributePaths = {"company"})
    Page<JobPosting> findAll(Pageable pageable);

    

}
