package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class AcademicAbilityId implements Serializable {
    private Long personalUser; // PersonalUser 엔티티의 ID와 매핑
    private Long school;       // School 엔티티의 ID와 매핑
}