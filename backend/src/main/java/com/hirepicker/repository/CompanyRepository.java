package com.hirepicker.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.Company;

@Repository // Spring의 리포지토리 빈으로 등록
public interface CompanyRepository extends JpaRepository<Company, Long> {
    // 회사 이름으로 회사를 찾는 메서드
    Optional<Company> findByCompanyName(String companyName);

    // 회사 이름으로 매칭되는 모든 회사를 반환 (중복 레코드가 있을 때 안전하게 처리하기 위해 추가)
    java.util.List<Company> findAllByCompanyName(String companyName);

    Optional<Company> findByCompanyId(String companyId);

    // 회사 인덱스로 회사를 찾는 메서드
    Optional<Company> findByCompanyIdx(Long companyIdx);

    // 회사 이름에 특정 문자열을 포함하는 회사를 페이징하여 찾는 메서드 (대소문자 무시)
    Page<Company> findByCompanyNameContainingIgnoreCase(String companyName, Pageable pageable);

    Optional<Company> findByCorpCode(String corpCode);
}