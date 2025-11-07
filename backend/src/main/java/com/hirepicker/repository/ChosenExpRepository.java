package com.hirepicker.repository;

import com.hirepicker.entity.ChosenExp;
import com.hirepicker.entity.ChosenExpId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// chosen_exp 리포지토리
public interface ChosenExpRepository extends JpaRepository<ChosenExp, ChosenExpId> {
    Optional<ChosenExp> findByResume_Id(Long resumeId);
    List<ChosenExp> findByResume_IdIn(List<Long> resumeIds);
    void deleteByResume_Id(Long resumeId);
}

