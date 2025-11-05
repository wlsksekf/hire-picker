package com.hirepicker.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "com_review")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_idx")
    private Long reviewIdx;

    @Lob
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "reviewer_type")
    private String reviewerType;

    @Column(name = "company_idx", nullable = false)
    private Long companyIdx;

    @Column(name = "p_user_idx", nullable = false)
    private Long pUserIdx;

    @Column(name = "write_date")
    private Date writeDate;
}
