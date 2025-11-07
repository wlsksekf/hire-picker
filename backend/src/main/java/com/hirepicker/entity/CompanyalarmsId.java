package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CompanyalarmsId implements Serializable {
    private Long personalUserId; // PersonalUser 엔티티의 id (p_user_idx)와 매핑
    private Long companyIdx; // Company 엔티티의 companyIdx와 매핑
}
