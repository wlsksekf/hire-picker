package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "company_alarms")
@IdClass(CompanyalarmsId.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Companyalarms {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", referencedColumnName = "p_user_idx")
    private PersonalUser personalUser;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_idx", referencedColumnName = "company_idx")
    private Company company;
}
