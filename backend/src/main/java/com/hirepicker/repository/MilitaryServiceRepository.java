package com.hirepicker.repository;

import com.hirepicker.entity.MilitaryService;
import org.springframework.data.jpa.repository.JpaRepository;

// military_service 엔티티 리포지토리
public interface MilitaryServiceRepository extends JpaRepository<MilitaryService, Long> {
}

