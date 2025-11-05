package com.hirepicker.repository;

import com.hirepicker.entity.WorkExperience;
import org.springframework.data.jpa.repository.JpaRepository;

// work_experience 엔티티용 리포지토리
public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
}

