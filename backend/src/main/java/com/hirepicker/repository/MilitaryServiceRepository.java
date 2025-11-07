package com.hirepicker.repository;

import com.hirepicker.entity.MilitaryService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// military_service 엔티티 리포지토리
public interface MilitaryServiceRepository extends JpaRepository<MilitaryService, Long> {
    // 개인회원 ID 기준 최근 병역 정보 1건
    Optional<MilitaryService> findTopByPersonalUserIdOrderByIdDesc(Long personalUserId);
}

