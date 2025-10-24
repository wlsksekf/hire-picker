package com.hirepicker.entity.payment;

import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.PersonalUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "credit_usage_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CreditUsageHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_idx")
    private Long usageIdx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx")
    private PersonalUser personalUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "c_user_idx")
    private CompanyUser companyUser;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(name = "credits_used", nullable = false)
    private Long creditsUsed;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        this.usedAt = LocalDateTime.now();
    }
}
