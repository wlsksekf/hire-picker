package com.hirepicker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.EmpEvent;

@Repository // Spring의 리포지토리 빈으로 등록
public interface EmpEventRepository extends JpaRepository<EmpEvent, Long>, EmpEventRepositoryCustom {
    // 이벤트 코드로 채용 이벤트를 찾는 메서드
    Optional<EmpEvent> findByEventCode(String eventCode);
}
