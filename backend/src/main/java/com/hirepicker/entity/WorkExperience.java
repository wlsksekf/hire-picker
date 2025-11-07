package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// work_experience 테이블 매핑 (개인회원 경력)
@Entity
@Table(name = "work_experience")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // DTO에서 new로 생성 가능하도록 public으로 노출
public class WorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exp_idx")
    private Long id; // 경력 PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "p_user_idx", nullable = false)
    private PersonalUser personalUser; // 개인회원 참조

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName; // 회사명

    @Column(name = "department", length = 100)
    private String department; // 부서

    @Column(name = "position", length = 100)
    private String position; // 직책

    @Column(name = "hire_date")
    private LocalDate hireDate; // 입사일

    @Column(name = "resign_date")
    private LocalDate resignDate; // 퇴사일

    @Lob
    @Column(name = "job_description")
    private String jobDescription; // 업무 설명

    @Column(name = "main_duties", length = 20)
    private String mainDuties; // 주요 직무 키워드

    @Builder
    public WorkExperience(Long id, PersonalUser personalUser, String companyName, String department,
                          String position, LocalDate hireDate, LocalDate resignDate,
                          String jobDescription, String mainDuties) {
        this.id = id;
        this.personalUser = personalUser;
        this.companyName = companyName;
        this.department = department;
        this.position = position;
        this.hireDate = hireDate;
        this.resignDate = resignDate;
        this.jobDescription = jobDescription;
        this.mainDuties = mainDuties;
    }
}