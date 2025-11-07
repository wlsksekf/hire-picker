package com.hirepicker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hirepicker.entity.Resume;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    @Query("SELECT r FROM Resume r WHERE r.personalUser.id = :personalUserId")
    List<Resume> findByPersonalUser_Id(@Param("personalUserId") Long personalUserId);

    // 개인회원 ID로 이력서 목록 조회(최신순)
    List<Resume> findByPersonalUserIdOrderByIdDesc(Long personalUserId);
}
