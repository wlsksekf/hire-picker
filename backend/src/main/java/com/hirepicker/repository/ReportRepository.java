package com.hirepicker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirepicker.entity.ReportHistory;

public interface ReportRepository extends JpaRepository<ReportHistory, Long> {}
