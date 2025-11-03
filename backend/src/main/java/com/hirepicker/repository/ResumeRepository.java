package com.hirepicker.repository;

import com.hirepicker.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

// Resume 엔티티에 대한 데이터베이스 작업을 처리하는 리포지토리
public interface ResumeRepository extends JpaRepository<Resume, Long> {
}
