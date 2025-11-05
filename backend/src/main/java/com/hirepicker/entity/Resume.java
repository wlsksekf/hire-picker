package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 이력서 정보를 담는 엔티티 (DB 명세 기반으로 재수정)
@Entity
@Table(name = "resumes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Resume extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_idx")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", nullable = false)
    private PersonalUser personalUser;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(name = "background_and_growth")
    private String selfGrowth;

    @Lob
    @Column(name = "personality")
    private String selfStrengths;

    @Lob
    @Column(name = "motivation_for_application")
    private String selfMotivation;

    @Lob
    @Column(name = "future_aspirations")
    private String selfAspirations;

    @Column(name = "img")
    private String imageUrl;

    @Column(name = "is_default")
    private boolean isDefault = false;

    private String status = "PUBLIC"; // ENUM 타입에 맞춰 "PUBLIC"으로 변경

    @Builder
    public Resume(PersonalUser personalUser, String title, String selfGrowth, String selfStrengths, 
                    String selfMotivation, String selfAspirations, String imageUrl) {
        this.personalUser = personalUser;
        this.title = title;
        this.selfGrowth = selfGrowth;
        this.selfStrengths = selfStrengths;
        this.selfMotivation = selfMotivation;
        this.selfAspirations = selfAspirations;
        this.imageUrl = imageUrl;
    }
}
