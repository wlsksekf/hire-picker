package com.hirepicker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hirepicker.entity.Company;
import com.hirepicker.entity.ComReview;
import com.hirepicker.entity.PersonalUser;

public interface ComReviewRepository extends JpaRepository<ComReview, Long> {
    // @Query("SELECT cr FROM ComReview cr WHERE cr.companyIdx = :companyIdx AND
    // cr.pUserIdx = :pUserIdx")
    @Query("SELECT cr FROM ComReview cr WHERE cr.company = :company AND cr.personalUser = :personalUser")
    Optional<ComReview> findByCompanyAndPersonalUser(@Param("company") Company company,
            @Param("personalUser") PersonalUser personalUser);
}
