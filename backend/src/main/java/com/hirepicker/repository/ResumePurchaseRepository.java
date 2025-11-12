package com.hirepicker.repository;

import com.hirepicker.entity.ResumePurchase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumePurchaseRepository extends JpaRepository<ResumePurchase, Long> {

    boolean existsByResume_IdAndPersonalUser_Id(Long resumeId, Long personalUserId);
}

