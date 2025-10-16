package com.hirepicker.repository;

import com.hirepicker.model.EmpEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpEventRepository extends JpaRepository<EmpEvent, Long> {
    Optional<EmpEvent> findByEventCode(String eventCode);
}
