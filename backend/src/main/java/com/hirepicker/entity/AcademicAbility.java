package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// academic_ability 테이블 매핑 (개인회원 학력 정보)
@Entity
@Table(name = "academic_ability")
@IdClass(AcademicAbilityId.class) // PK: p_user_idx + school_code (DDL 반영)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AcademicAbility {

    // PK 구성: p_user_idx + school_code
    @Id
    @Column(name = "p_user_idx", nullable = false)
    private Long personalUser; // 개인회원 ID

    @Id
    @Column(name = "school_code", nullable = false)
    private Long school; // 학교 코드

    @Column(name = "degree", nullable = false, length = 10)
    private String degree; // 학위(고졸/학사/석사/박사)

    @Column(name = "major", nullable = false, length = 100)
    private String major; // 전공

    @Column(name = "major_score", precision = 2, scale = 1, nullable = false)
    private java.math.BigDecimal majorScore; // 전공 점수(2,1)

    @Column(name = "admission_date")
    private LocalDate admissionDate; // 입학일

    @Column(name = "graduation_date")
    private LocalDate graduationDate; // 졸업일

    @Builder
    public AcademicAbility(Long personalUser, Long school, String degree, String major,
                           java.math.BigDecimal majorScore, LocalDate admissionDate, LocalDate graduationDate) {
        this.personalUser = personalUser;
        this.school = school;
        this.degree = degree;
        this.major = major;
        this.majorScore = majorScore;
        this.admissionDate = admissionDate;
        this.graduationDate = graduationDate;
    }
}