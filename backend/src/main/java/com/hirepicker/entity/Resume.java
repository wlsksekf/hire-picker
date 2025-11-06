package com.hirepicker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 이력서 엔티티 (resumes 테이블 스키마 반영)
@Entity
@Table(name = "resumes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Resume extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_idx")
    private Long id; // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", nullable = false)
    private PersonalUser personalUser; // 개인회원

    @Column(nullable = false, length = 70)
    private String title; // 제목

    @Lob
    @Column(name = "background_and_growth")
    private String selfGrowth; // 성장 배경

    @Lob
    @Column(name = "personality")
    private String selfStrengths; // 성격

    @Lob
    @Column(name = "motivation_for_application")
    private String selfMotivation; // 지원 동기

    @Lob
    @Column(name = "future_aspirations")
    private String selfAspirations; // 포부

    @Column(name = "img", length = 255)
    private String imageUrl; // 프로필 이미지 경로

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false; // 기본 이력서 여부

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ResumeStatus status = ResumeStatus.PUBLIC; // 공개 상태

    @Column(name = "cert", length = 200)
    private String cert; // 자격증 요약

    @Column(name = "cancel")
    private Boolean cancel; // 취소 여부(null 허용)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exp_idx")
    private WorkExperience workExperience; // 경력 연결(optional)

    @Builder
    public Resume(PersonalUser personalUser, String title, String selfGrowth, String selfStrengths,
            String selfMotivation, String selfAspirations, String imageUrl,
            Boolean isDefault, ResumeStatus status, String cert, Boolean cancel,
            WorkExperience workExperience) {
        this.personalUser = personalUser;
        this.title = title;
        this.selfGrowth = selfGrowth;
        this.selfStrengths = selfStrengths;
        this.selfMotivation = selfMotivation;
        this.selfAspirations = selfAspirations;
        this.imageUrl = imageUrl;
        if (isDefault != null)
            this.isDefault = isDefault;
        if (status != null)
            this.status = status;
        this.cert = cert;
        this.cancel = cancel;
        this.workExperience = workExperience;
    }

    // 선택 경력 연동(서비스에서 조건부로 세팅)
    public void attachWorkExperience(WorkExperience workExperience) {
        this.workExperience = workExperience;
    }
}
