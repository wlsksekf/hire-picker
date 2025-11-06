package com.hirepicker.repository;

import com.hirepicker.entity.Companyalarms;
import com.hirepicker.entity.CompanyalarmsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyalarmsRepository extends JpaRepository<Companyalarms, CompanyalarmsId> {
    List<Companyalarms> findByPersonalUserId_Id(Long personalUserId);
    Optional<Companyalarms> findByPersonalUserId_IdAndCompanyIdx_CompanyIdx(Long personalUserId, Long companyIdx);
    void deleteByPersonalUserId_IdAndCompanyIdx_CompanyIdx(Long personalUserId, Long companyIdx);
}
