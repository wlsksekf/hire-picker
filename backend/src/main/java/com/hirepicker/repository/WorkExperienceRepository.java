package com.hirepicker.repository;

import com.hirepicker.entity.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// work_experience 엔티티용 리포지토리
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
    // 개인회원 ID로 경력 목록 조회
    List<WorkExperience> findByPersonalUserIdOrderByHireDateDesc(Long personalUserId);
}

