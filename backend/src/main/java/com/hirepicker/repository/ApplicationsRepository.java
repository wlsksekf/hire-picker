package com.hirepicker.repository;

import com.hirepicker.entity.Applications;
import com.hirepicker.entity.ApplicationsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationsRepository extends JpaRepository<Applications, ApplicationsId> {

    // 복수 이력서에 대한 지원 상태별 공고 식별자 목록 조회
    @Query("SELECT a.postingIdx FROM Applications a WHERE a.resumeIdx IN :resumeIdxs AND a.status = :status")
    List<Long> findPostingIdxByResumeIdxInAndStatus(@Param("resumeIdxs") List<Long> resumeIdxs, @Param("status") String status);

    boolean existsByResumeIdxAndPostingIdx(Long resumeIdx, Long postingIdx);

    List<Applications> findByResumeIdx(Long resumeIdx);

    // 개인회원이 가진 여러 이력서의 지원 기록 조회
    List<Applications> findByResumeIdxIn(List<Long> resumeIdxs);

    // 기업회원이 특정 공고에 받은 지원서를 최신순으로 조회
    List<Applications> findByPostingIdxOrderByResumeDateDesc(Long postingIdx);

    // 기업회원이 특정 지원서를 단일 조회
    Optional<Applications> findByResumeIdxAndPostingIdx(Long resumeIdx, Long postingIdx);
}
