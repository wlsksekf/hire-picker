package com.hirepicker.entity.payment;

import com.hirepicker.entity.PersonalUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "personal_user_credit")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalUserCredit {

    @Id
    @Column(name = "p_user_idx")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "p_user_idx")
    private PersonalUser personalUser;

    @Column(name = "balance", nullable = false)
    @Builder.Default
    private Long balance = 0L;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public PersonalUserCredit(PersonalUser personalUser, Long balance) {
        this.personalUser = personalUser;
        this.balance = balance;
        this.updatedAt = LocalDateTime.now();
    }
}
