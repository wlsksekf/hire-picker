package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "job_posting")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "posting_idx")
    private Long postingIdx;

    @Column(name = "posting_id", unique = true)
    private String postingId;

    @ManyToOne
    @JoinColumn(name = "company_idx", nullable = false)
    private Company company;
 
    // c_user_idx는 API로 채울 수 없으므로 nullable로 가정. 스키마와 다를 경우 조정 필요.
    @Column(name = "c_user_idx")
    private Long cUserIdx;  

    @Column(name = "title")
    private String title;

    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @Column(name = "location")
    private String location;// DB 에 Location으로 저장되어있음
}
