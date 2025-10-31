package com.hirepicker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.Certification;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    
    // 자격증 이름으로 조회 (중복 체크용)
    Optional<Certification> findByCertName(String certName);
}

