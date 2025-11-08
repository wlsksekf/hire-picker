package com.hirepicker.entity;

// 공고 상태 enum (DB enum: OPEN | CLOSED | DRAFT)
public enum JobPostingStatus {
    OPEN,    // 모집중
    CLOSED,  // 마감
    DRAFT    // 임시저장
}

