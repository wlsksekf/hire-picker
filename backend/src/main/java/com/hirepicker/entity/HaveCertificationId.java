package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// 이력서 보유 자격증 복합키
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class HaveCertificationId implements Serializable {
    private Long resumeIdx; // resumes.resume_idx
    private Long certIdx;  // certification.cert_idx
}

