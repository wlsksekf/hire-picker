package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// 지원서 복합키
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ApplicationsId implements Serializable {
    private Long resumeIdx;  // resumes.resume_idx
    private Long postingIdx;  // job_posting.posting_idx
}

