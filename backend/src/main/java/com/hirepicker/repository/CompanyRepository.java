package com.hirepicker.repository;

import com.hirepicker.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyName(String companyName);
    Optional<Company> findByCompanyId(String companyId);
    
    Page<Company> findByCompanyNameContainingIgnoreCase(String companyName, Pageable pageable);
}