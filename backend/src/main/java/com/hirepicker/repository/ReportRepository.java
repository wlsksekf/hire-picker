package com.hirepicker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.hirepicker.dto.ReportResponseDto;
import com.hirepicker.entity.ReportHistory;

@Repository
public interface ReportRepository extends JpaRepository<ReportHistory, Long> {
@Query("SELECT new com.hirepicker.dto.ReportResponseDto(r.reportHistoryIdx, r.targetIdx, r.reason, r.reportDate, target.nickname) " +
       "FROM ReportHistory r JOIN PersonalUser target ON r.targetIdx = target.id")
List<ReportResponseDto> findAllWithTargetNickname();
}

