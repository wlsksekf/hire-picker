package com.hirepicker.entity;

import java.io.Serializable;

// academic_ability 복합키 식별자 (p_user_idx, school_code, degree)
public class AcademicAbilityId implements Serializable {
    private Long personalUser; // p_user_idx (FK 필드명과 일치하도록 선언)
    private Long school;       // school_code (FK 필드명과 일치하도록 선언)
    private String degree;     // 학위 문자열
}

