package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@Table(name = "company")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_idx")
    private Long companyIdx;

    @Column(name = "company_id", unique = true)
    private String companyId;

    @Column(name = "company_name")
    private String companyName;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "business_number")
    private String businessNumber;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "company_type")
    private String companyType;

    @Column(name = "ceo_name")
    private String ceoName;

    @Column(name = "address")
    private String address;

    @Column(name = "employee_count")
    private String employeeCount;

    @Column(name = "corp_code")
    private String corpCode;

}