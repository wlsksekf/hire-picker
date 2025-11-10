package com.hirepicker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.Certification;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    
    // 자격증 이름으로 조회 (중복 체크용)
    Optional<Certification> findByCertName(String certName);

    // 자격증 이름 부분검색(자동완성용) 상위 10건
    List<Certification> findTop10ByCertNameContainingIgnoreCaseOrderByCertNameAsc(String keyword);
}

