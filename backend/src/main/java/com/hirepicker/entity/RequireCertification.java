package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 공고 필수 자격증 엔티티(require_certification 테이블 매핑)
@Entity
@Table(name = "require_certification")
@IdClass(RequireCertificationId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequireCertification {

    @Id
    @Column(name = "posting_idx")
    private Long postingIdx; // 공고 ID (FK: job_posting)

    @Id
    @Column(name = "cert_idx")
    private Long certIdx; // 자격증 ID (FK: certification)
}

