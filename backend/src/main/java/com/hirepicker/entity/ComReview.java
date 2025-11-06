package com.hirepicker.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne
    @JoinColumn(name = "company_idx", nullable = false)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "p_user_idx", nullable = false)
    private PersonalUser personalUser;

    @Column(name = "write_date")
    private Date writeDate;
}
