package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 이력서 엔티티(resumes 테이블 매핑)
@Entity
@Table(name = "resumes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder // 빌더 패턴 자동 생성
public class Resume extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_idx")
    private Long id; // PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", nullable = false)
    private PersonalUser personalUser; // 개인 회원

    @Column(nullable = false, length = 70)
    private String title; // 제목

    @Lob
    @Column(name = "background_and_growth")
    private String selfGrowth; // 성장 배경

    @Lob
    @Column(name = "personality")
    private String selfStrengths; // 성격/강점

    @Lob
    @Column(name = "motivation_for_application")
    private String selfMotivation; // 지원 동기

    @Lob
    @Column(name = "future_aspirations")
    private String selfAspirations; // 포부

    @Column(name = "img", length = 255)
    private String imageUrl; // 이미지 경로

    @Column(name = "credit_cost", nullable = false)
    @Builder.Default // 빌더 기본값 설정
    private int creditCost = 0; // 열람 시 필요한 크레딧 비용

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default // 빌더 기본값 설정
    private ResumeStatus status = ResumeStatus.PUBLIC; // 공개 상태

    @Column(name = "cert", length = 200)
    private String cert; // 자격 요약

    @Column(name = "cancel")
    private Boolean cancel; // 취소 여부

    @OneToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(name = "chosen_exp",
        joinColumns = @JoinColumn(name = "resume_idx"),
        inverseJoinColumns = @JoinColumn(name = "exp_idx"))
    private WorkExperience workExperience;

    // 모든 필드를 포함하는 생성자 (Lombok @Builder가 사용)
    @Builder
    public Resume(Long id, PersonalUser personalUser, String title, String selfGrowth, String selfStrengths,
                  String selfMotivation, String selfAspirations, String imageUrl, int creditCost,
                  ResumeStatus status, String cert, Boolean cancel, WorkExperience workExperience) {
        this.id = id;
        this.personalUser = personalUser;
        this.title = title;
        this.selfGrowth = selfGrowth;
        this.selfStrengths = selfStrengths;
        this.selfMotivation = selfMotivation;
        this.selfAspirations = selfAspirations;
        this.imageUrl = imageUrl;
        this.creditCost = creditCost;
        this.status = status;
        this.cert = cert;
        this.cancel = cancel;
        this.workExperience = workExperience;
    }


    // 경력 연결을 위한 편의 메서드
    public void attachWorkExperience(WorkExperience workExperience) {
        this.workExperience = workExperience;
    }
}
