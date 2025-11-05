package com.hirepicker.entity;

import java.io.Serializable;
import java.util.Objects;

// academic_ability 복합 기본키 (p_user_idx, school_code, degree)
public class AcademicAbilityId implements Serializable {
    private static final long serialVersionUID = 1L; // 직렬화 버전 UID 추가

    private Long personalUser; // p_user_idx (FK 컬럼과 매칭)
    private Long school;       // school_code (FK 컬럼과 매칭)
    private String degree;     // 학위 문자열

    // 기본 생성자 (JPA 요구)
    public AcademicAbilityId() {}

    // 편의 생성자
    public AcademicAbilityId(Long personalUser, Long school, String degree) {
        this.personalUser = personalUser;
        this.school = school;
        this.degree = degree;
    }

    // getter/setter 추가로 필드 사용 경고 제거 및 JPA 접근 지원
    public Long getPersonalUser() { // 개인 사용자 식별자 반환
        return personalUser;
    }

    public void setPersonalUser(Long personalUser) { // 개인 사용자 식별자 설정
        this.personalUser = personalUser;
    }

    public Long getSchool() { // 학교 코드 반환
        return school;
    }

    public void setSchool(Long school) { // 학교 코드 설정
        this.school = school;
    }

    public String getDegree() { // 학위 반환
        return degree;
    }

    public void setDegree(String degree) { // 학위 설정
        this.degree = degree;
    }

    // equals/hashCode 구현(모든 키 필드 기준)
    @Override
    public boolean equals(Object o) { // 동일성 비교
        if (this == o) return true;
        if (!(o instanceof AcademicAbilityId)) return false;
        AcademicAbilityId that = (AcademicAbilityId) o;
        return Objects.equals(personalUser, that.personalUser)
                && Objects.equals(school, that.school)
                && Objects.equals(degree, that.degree);
    }

    @Override
    public int hashCode() { // 해시 계산
        return Objects.hash(personalUser, school, degree);
    }
}

