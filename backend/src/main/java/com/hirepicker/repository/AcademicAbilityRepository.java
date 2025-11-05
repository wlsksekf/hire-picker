package com.hirepicker.repository;

import com.hirepicker.entity.AcademicAbility;
import com.hirepicker.entity.AcademicAbilityId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// academic_ability 엔티티 리포지토리
public interface AcademicAbilityRepository extends JpaRepository<AcademicAbility, AcademicAbilityId> {
    // 개인회원 ID로 학력 목록 조회
    List<AcademicAbility> findByPersonalUserIdOrderByGraduationDateDesc(Long personalUserId);
}

