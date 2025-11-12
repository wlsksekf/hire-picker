package com.hirepicker.repository;

import com.hirepicker.entity.Resume;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Resume 엔티티에 대한 데이터베이스 작업을 처리하는 리포지토리
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    // 개인회원 ID로 이력서 목록 조회(최신순)
    @Query("SELECT r FROM Resume r LEFT JOIN FETCH r.workExperience WHERE r.personalUser.id = :personalUserId ORDER BY r.id DESC")
    List<Resume> findByPersonalUserIdOrderByIdDesc(@Param("personalUserId") Long personalUserId);

    // 개인회원 ID로 최신 이력서 조회
    java.util.Optional<Resume> findTopByPersonalUserIdOrderByIdDesc(Long personalUserId);
}
