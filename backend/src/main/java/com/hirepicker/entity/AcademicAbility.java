package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// academic_ability 테이블 매핑 (개인회원 학력)
@Entity
@Table(name = "academic_ability")
@IdClass(AcademicAbilityId.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AcademicAbility {

    // 복합키: p_user_idx + school_code + degree
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", nullable = false)
    private PersonalUser personalUser; // 개인회원

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_code", nullable = false)
    private School school; // 학교

    @Id
    @Column(name = "degree", nullable = false, length = 10)
    private String degree; // 학위(문자열 저장: 고졸/학사/석사/박사)

    @Column(name = "major", nullable = false, length = 100)
    private String major; // 전공

    @Column(name = "major_score", precision = 2, scale = 1, nullable = false)
    private java.math.BigDecimal majorScore; // 전공 학점(2,1)

    @Column(name = "graduation_date")
    private LocalDate graduationDate; // 졸업일
}

