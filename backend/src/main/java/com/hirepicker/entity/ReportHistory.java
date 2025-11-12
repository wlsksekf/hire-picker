package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_history_idx")
    private Long reportHistoryIdx;

    @Column(name = "reporter_idx", nullable = false)
    private Long reporterIdx;

    @Column(name = "target_idx", nullable = false)
    private Long targetIdx;

    @Column(name = "reason", length = 100)
    private String reason;

    @Column(name = "report_date")
    private LocalDateTime reportDate;
}
