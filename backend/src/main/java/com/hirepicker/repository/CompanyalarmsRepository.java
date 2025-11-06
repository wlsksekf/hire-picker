package com.hirepicker.repository;

import com.hirepicker.entity.Companyalarms;
import com.hirepicker.entity.CompanyalarmsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyalarmsRepository extends JpaRepository<Companyalarms, CompanyalarmsId> {
    List<Companyalarms> findBypUserIdx_Id(Long pUserIdx);
    Optional<Companyalarms> findBypUserIdx_IdAndCompanyIdx_CompanyIdx(Long pUserIdx, Long companyIdx);
    void deleteBypUserIdx_IdAndCompanyIdx_CompanyIdx(Long pUserIdx, Long companyIdx);
}
