package com.hirepicker.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 지원서 엔티티(applications 테이블 매핑)
@Entity
@Table(name = "applications")
@IdClass(ApplicationsId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Applications {

    @Id
    @Column(name = "resume_idx")
    private Long resumeIdx; // 이력서 ID (FK: resumes, PK)

    @Id
    @Column(name = "posting_idx")
    private Long postingIdx; // 공고 ID (FK: job_posting, PK)

    @Column(name = "resume_date")
    private LocalDateTime resumeDate; // 지원일시

    @Column(name = "status", length = 50)
    private String status; // 지원 상태
}
