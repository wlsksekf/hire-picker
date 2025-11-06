package com.hirepicker.entity;

import java.io.Serializable;
import java.util.Objects;

// academic_ability 복합 기본키(p_user_idx, school_code) 매핑
public class AcademicAbilityId implements Serializable {
    private static final long serialVersionUID = 1L; // 직렬화 버전 UID

    // 엔티티의 @Id 필드와 이름/타입을 동일하게 맞춘다(Long 타입 사용)
    private Long personalUser; // p_user_idx
    private Long school;       // school_code

    public AcademicAbilityId() {}

    // 두 키만 사용하는 생성자
    public AcademicAbilityId(Long personalUser, Long school) {
        this.personalUser = personalUser;
        this.school = school;
    }

    public Long getPersonalUser() { return personalUser; }
    public void setPersonalUser(Long personalUser) { this.personalUser = personalUser; }

    public Long getSchool() { return school; }
    public void setSchool(Long school) { this.school = school; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AcademicAbilityId)) return false;
        AcademicAbilityId that = (AcademicAbilityId) o;
        return Objects.equals(personalUser, that.personalUser)
                && Objects.equals(school, that.school);
    }

    @Override
    public int hashCode() { return Objects.hash(personalUser, school); }
}

