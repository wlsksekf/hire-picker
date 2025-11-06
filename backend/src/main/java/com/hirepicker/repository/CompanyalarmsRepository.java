package com.hirepicker.repository;

import com.hirepicker.entity.Companyalarms;
import com.hirepicker.entity.CompanyalarmsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyalarmsRepository extends JpaRepository<Companyalarms, CompanyalarmsId> {
    List<Companyalarms> findByPersonalUser_Id(Long pUserIdx);
    Optional<Companyalarms> findByPersonalUser_IdAndCompany_CompanyIdx(Long pUserIdx, Long companyIdx);
    void deleteByPersonalUser_IdAndCompany_CompanyIdx(Long pUserIdx, Long companyIdx);
}
