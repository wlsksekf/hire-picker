package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// 공고 북마크 복합키
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PostingBookmarkId implements Serializable {
    private Long postingIdx; // job_posting.posting_idx
    private Long pUserIdx;   // personal_user.p_user_idx
}

