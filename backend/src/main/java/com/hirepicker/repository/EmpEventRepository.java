package com.hirepicker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.EmpEvent;

import java.util.Optional;

@Repository
public interface EmpEventRepository extends JpaRepository<EmpEvent, Long> {
    Optional<EmpEvent> findByEventCode(String eventCode);
}
