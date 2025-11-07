
package com.hirepicker.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Applications {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "resume_idx")
    private Long resumeIdx;

    @Column(name = "posting_idx")
    private Long postingIdx;

    @Column(name = "resume_date")
    private Date resume_date;

    @Column(name = "status")
    private String status;


}
