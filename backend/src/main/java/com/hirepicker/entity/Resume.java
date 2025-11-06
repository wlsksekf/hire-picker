package com.hirepicker.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "resumes")
@Getter
@Setter
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_idx")
    private Long resumeIdx;

    @Column(name = "p_user_idx", nullable = false)
    private Long pUserIdx;

    @Column(nullable = false)
    private String title;

    @Column(name = "background_and_growth", columnDefinition = "TEXT")
    private String backgroundAndGrowth;

    @Column(columnDefinition = "TEXT")
    private String personality;

    @Column(name = "motivation_for_application", columnDefinition = "TEXT")
    private String motivationForApplication;

    @Column(name = "future_aspirations", columnDefinition = "TEXT")
    private String futureAspirations;

    private String cert;

    @Column(name = "is_default")
    private Boolean isDefault;

    private String status;

    @Column(name = "reg_date")
    private Date regDate;

    @Column(name = "mod_date")
    private Date modDate;

    private Boolean cancel;

    private String img;
}
