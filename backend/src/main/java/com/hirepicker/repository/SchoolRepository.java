package com.hirepicker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.School;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    
    // schoolName과 campus로 기존 학교 데이터 조회
    Optional<School> findBySchoolNameAndCampus(String schoolName, String campus);

    // 학교 이름으로 검색 (부분 일치)
    List<School> findBySchoolNameContaining(String schoolName);
}
