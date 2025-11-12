package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 공고 북마크 엔티티(posting_bookmark 테이블 매핑)
@Entity
@Table(name = "posting_bookmark")
@IdClass(PostingBookmarkId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostingBookmark {

    @Id
    @Column(name = "posting_idx")
    private Long postingIdx; // 공고 ID (FK: job_posting)

    @Id
    @Column(name = "p_user_idx")
    private Long pUserIdx; // 사용자 ID (FK: personal_user)
}

