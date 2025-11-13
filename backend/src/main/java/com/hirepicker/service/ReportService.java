package com.hirepicker.service;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hirepicker.dto.ReportRequestDto;
import com.hirepicker.dto.ReportResponseDto;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.ReportHistory;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.ReportRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    private final ReportRepository reportRepository;
    private final PersonalUserRepository personalUserRepository;
    public void createReport(ReportRequestDto dto, Long reporterIdx) {
        if (dto.getTargetIdx() == null) {
            throw new IllegalArgumentException("targetIdx는 null일 수 없습니다.");
        }
        log.info(">> dto.targetIdx = {}", dto.getTargetIdx());
        log.info(">> dto.reason = {}", dto.getReason());

        String reportDateStr = dto.getReportDate();
        LocalDateTime reportDate;
        if (reportDateStr != null) {
            try {
                // 프론트에서 '2025-11-13T05:28:04.969Z' 형태로 올 때 안전하게 처리
                reportDate = ZonedDateTime.parse(reportDateStr).toLocalDateTime();
            } catch (DateTimeParseException ex) {
                log.warn("날짜 파싱 실패: {}, 기본값(LocalDateTime.now) 사용", reportDateStr);
                reportDate = LocalDateTime.now();
            }
        } else {
            reportDate = LocalDateTime.now();
        }

        ReportHistory report = ReportHistory.builder()
            .reporterIdx(reporterIdx)
            .targetIdx(dto.getTargetIdx())
            .reason(dto.getReason())
            .reportDate(reportDate)
            .build();

        log.info(">> entity.targetIdx = {}", report.getTargetIdx());
        reportRepository.save(report);
    }

    public List<ReportResponseDto> getAllReports(){
        List<ReportHistory> reports = reportRepository.findAll();
        return reports.stream().map(report -> {
            // 대상자 닉네임 가져오기 (targetIdx 사용 예시)
            String nickname = personalUserRepository.findById(report.getTargetIdx())
                .map(PersonalUser::getNickname)
                .orElse("알수없음");
            return ReportResponseDto.builder()
                .reportHistoryIdx(report.getReportHistoryIdx())
                .targetIdx(report.getTargetIdx())
                .reason(report.getReason())
                .reportDate(report.getReportDate())
                .nickname(nickname)
                .build();
        }).toList();
    }
}
