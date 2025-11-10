package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// 공고 필수 자격증 복합키
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RequireCertificationId implements Serializable {
    private Long postingIdx; // job_posting.posting_idx
    private Long certIdx;    // certification.cert_idx
}

