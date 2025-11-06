package com.hirepicker.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CompanyalarmsId implements Serializable {
    private Long personalUser; // PersonalUser 엔티티의 id와 매핑
    private Long company;      // Company 엔티티의 companyIdx와 매핑
}
