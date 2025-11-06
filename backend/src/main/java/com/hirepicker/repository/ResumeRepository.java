package com.hirepicker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hirepicker.entity.Resume;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    @Query("SELECT r FROM Resume r WHERE r.pUserIdx = :pUserIdx")
    List<Resume> findByPUserIdx(@Param("pUserIdx") Long pUserIdx);
}
