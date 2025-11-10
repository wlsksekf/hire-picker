package com.hirepicker.repository;

import com.hirepicker.entity.Applications;
import com.hirepicker.entity.ApplicationsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ApplicationsRepository extends JpaRepository<Applications, ApplicationsId> {

    // 복수 이력서에 대한 지원 상태별 공고 식별자 목록 조회
    @Query("SELECT a.postingIdx FROM Applications a WHERE a.resumeIdx IN :resumeIdxs AND a.status = :status")
    List<Long> findPostingIdxByResumeIdxInAndStatus(@Param("resumeIdxs") List<Long> resumeIdxs, @Param("status") String status);
}
