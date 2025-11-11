package com.hirepicker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.JobPosting;

@Repository // Spring의 리포지토리 빈으로 등록
public interface JobPostingRepository extends JpaRepository<JobPosting, Long>, JpaSpecificationExecutor<JobPosting> {
    // 공고 ID로 채용 공고를 찾는 메서드
    Optional<JobPosting> findByPostingId(String postingId);

    // 공고 인덱스로 채용 공고를 찾는 메서드
    Optional<JobPosting> findByPostingIdx(Long postingIdx);

    // AI 챗봇에서 키워드와 지역으로 채용 공고를 검색하는 메소드 추가
    List<JobPosting> findByTitleContaining(String keyword); // 키워드로만 검색

    List<JobPosting> findByTitleContainingAndLocation(String keyword, String location);

    // N+1 문제 해결을 위해 @EntityGraph 사용 (company 엔티티를 함께 fetch)
    @Override
    @EntityGraph(attributePaths = { "company" })
    Page<JobPosting> findAll(Pageable pageable);

    List<JobPosting> findByPostingIdxIn(List<Long> postingIdxs);

    List<JobPosting> findByCompany_CompanyIdx(Long companyIdx);

}
