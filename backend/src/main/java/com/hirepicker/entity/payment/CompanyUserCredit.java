package com.hirepicker.entity.payment;

import com.hirepicker.entity.CompanyUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_user_credit")
@Getter @Setter
public class CompanyUserCredit {

    @Id
    @Column(name = "c_user_idx")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "c_user_idx")
    private CompanyUser companyUser;

    @Column(name = "balance", nullable = false)
    private Long balance = 0L;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
