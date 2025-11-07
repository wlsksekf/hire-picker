package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// military_service 테이블 매핑 (개인회원 병역 정보)
@Entity
@Table(name = "military_service")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MilitaryService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "military_idx")
    private Long id; // 병역 PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", nullable = false)
    private PersonalUser personalUser; // 개인회원 참조

    @Column(name = "service_type", length = 10)
    private String serviceType; // 병역 유형

    @Column(name = "military_branch", length = 10)
    private String militaryBranch; // 병과

    @Column(name = "military_rank", length = 10)
    private String militaryRank; // 계급

    @Column(name = "period_of_service", length = 20)
    private String periodOfService; // 복무 기간

    @Column(name = "reason_for_exemption", length = 20)
    private String reasonForExemption; // 면제 사유

    @Builder
    public MilitaryService(Long id, PersonalUser personalUser, String serviceType,
                           String militaryBranch, String militaryRank, String periodOfService,
                           String reasonForExemption) {
        this.id = id;
        this.personalUser = personalUser;
        this.serviceType = serviceType;
        this.militaryBranch = militaryBranch;
        this.militaryRank = militaryRank;
        this.periodOfService = periodOfService;
        this.reasonForExemption = reasonForExemption;
    }
}