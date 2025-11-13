package com.hirepicker.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.hirepicker.dto.ReportRequestDto;
import com.hirepicker.entity.ReportHistory;
import com.hirepicker.repository.ReportRepository;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;

    public void createReport(ReportRequestDto dto, Long reporterIdx) {
        ReportRepository report = ReportRepository.builder()
            .reporterIdx(reporterIdx)
            .targetIdx(dto.getTargetIdx())
            .reason(dto.getReason())             // 모든 사유(기타포함) 하나로!
            .reportDate(LocalDateTime.parse(dto.getReportDate()))
            .build();
        reportRepository.save(report);
    }
}
