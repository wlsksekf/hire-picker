package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 이력서 보유 자격증 엔티티(have_certification 테이블 매핑)
@Entity
@Table(name = "have_certification")
@IdClass(HaveCertificationId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HaveCertification {

    @Id
    @Column(name = "resume_idx")
    private Long resumeIdx; // 이력서 ID (FK: resumes)

    @Id
    @Column(name = "cert_idx")
    private Long certIdx; // 자격증 ID (FK: certification)
}

