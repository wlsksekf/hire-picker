package com.hirepicker.entity.payment;

import com.hirepicker.entity.PersonalUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "personal_user_credit")
@Getter @Setter
public class PersonalUserCredit {

    @Id
    @Column(name = "p_user_idx")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "p_user_idx")
    private PersonalUser personalUser;

    @Column(name = "balance", nullable = false)
    private Long balance = 0L;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
