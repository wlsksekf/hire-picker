package com.hirepicker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.School;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    
    // 학교 이름으로 검색 (부분 일치)
    List<School> findBySchoolNameContaining(String schoolName);

    // 학교 이름 정확 일치(대소문자 무시)
    Optional<School> findFirstBySchoolNameIgnoreCase(String schoolName);
}
