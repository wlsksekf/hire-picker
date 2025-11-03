package com.hirepicker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.EmpEvent;

@Repository // Spring의 리포지토리 빈으로 등록
public interface EmpEventRepository extends JpaRepository<EmpEvent, Long> {
    // 이벤트 코드로 채용 이벤트를 찾는 메서드
    Optional<EmpEvent> findByEventCode(String eventCode);

    // 여러 지역 중 하나라도 포함하는 채용 이벤트를 찾는 메서드 (예: "서울/경기 지역"에 "서울"이 포함되는 경우)
    @Query("SELECT e FROM EmpEvent e WHERE " +
            "(:areas IS NULL OR :areas = '' OR " + // If areas list is null or empty, return all
            "EXISTS (SELECT a FROM IN (:areas) a WHERE e.area LIKE CONCAT('%', a, '%')))")
    List<EmpEvent> findByAreaContainingAnyOf(@Param("areas") List<String> areas);
}
