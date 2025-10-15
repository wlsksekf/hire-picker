package com.hirepicker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
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
}