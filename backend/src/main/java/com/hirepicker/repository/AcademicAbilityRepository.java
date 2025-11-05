package com.hirepicker.repository;

import com.hirepicker.entity.AcademicAbility;
import com.hirepicker.entity.AcademicAbilityId;
import org.springframework.data.jpa.repository.JpaRepository;

// academic_ability 엔티티 리포지토리
public interface AcademicAbilityRepository extends JpaRepository<AcademicAbility, AcademicAbilityId> {
}

