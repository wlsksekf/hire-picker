package com.hirepicker.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // JPA 엔티티임을 선언
@Table(name = "job_posting") // "job_posting" 테이블과 매핑
@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor를 모두
      // 포함
@Builder // 빌더 패턴을 사용하여 객체 생성
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드를 포함하는 생성자 자동 생성
public class JobPosting {

    @Id // 기본 키 필드
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본 키 값 자동 생성 (DB에 위임)
    @Column(name = "posting_idx") // "posting_idx" 컬럼과 매핑
    private Long postingIdx;

    @Column(name = "posting_id", unique = true) // 유니크한 "posting_id" 컬럼과 매핑
    private String postingId;

    @ManyToOne // 다대일 관계
    @JoinColumn(name = "company_idx", nullable = false) // "company_idx" 컬럼을 통해 Company 엔티티와 조인
    private Company company;

    // c_user_idx는 API로 채울 수 없으므로 nullable로 가정. 스키마와 다를 경우 조정 필요.
    @Column(name = "c_user_idx") // "c_user_idx" 컬럼과 매핑
    private Long cUserIdx;

    @Column(name = "title") // "title" 컬럼과 매핑
    private String title;

    @Column(name = "employment_type", length = 50) // "employment_type" 컬럼과 매핑 (최대 길이 50)
    private String employmentType;

    @Column(name = "location") // "location" 컬럼과 매핑
    private String location;

    @Column(name = "experience_level")
    private String experience_level;

    @Column(name = "job_type")
    private String jobType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}
