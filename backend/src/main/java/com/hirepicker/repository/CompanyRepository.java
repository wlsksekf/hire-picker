package com.hirepicker.repository;

import com.hirepicker.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Spring의 리포지토리 빈으로 등록
public interface CompanyRepository extends JpaRepository<Company, Long> {
    // 회사 이름으로 회사를 찾는 메서드
    Optional<Company> findByCompanyName(String companyName);
    // 회사 ID로 회사를 찾는 메서드
    Optional<Company> findByCompanyId(String companyId);
    
    // 회사 이름에 특정 문자열을 포함하는 회사를 페이징하여 찾는 메서드 (대소문자 무시)
    Page<Company> findByCompanyNameContainingIgnoreCase(String companyName, Pageable pageable);
}