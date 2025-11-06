package com.hirepicker.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "company_alarm")
@IdClass(CompanyalarmsId.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Companyalarms {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", referencedColumnName = "p_user_idx")
    private PersonalUser pUserIdx;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_idx", referencedColumnName = "company_idx")
    private Company companyIdx;
}
