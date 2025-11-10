package com.hirepicker.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity // JPA 엔티티임을 선언
@Table(name = "job_posting") // "job_posting" 테이블과 매핑
@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor를 모두
      // 포함
@Builder // 빌더 패턴을 사용하여 객체 생성
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드를 포함하는 생성자 자동 생성
@EntityListeners(AuditingEntityListener.class)
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

    @Lob // 대용량 데이터를 저장하기 위한 어노테이션
    @Column(name = "welfare", columnDefinition = "TEXT") // 복리후생
    private String welfare;

    @Lob // 대용량 데이터를 저장하기 위한 어노테이션
    @Column(name = "description", columnDefinition = "TEXT") // 공고 설명
    private String description;

    @Lob // 대용량 데이터를 저장하기 위한 어노테이션
    @Column(name = "required_qualifications", columnDefinition = "TEXT") // 필수 자격요건
    private String requiredQualifications;

    @Lob // 대용량 데이터를 저장하기 위한 어노테이션
    @Column(name = "preferred_qualifications", columnDefinition = "TEXT") // 우대 자격요건
    private String preferredQualifications;

    @Column(name = "employment_type", length = 50) // "employment_type" 컬럼과 매핑 (최대 길이 50)
    private String employmentType;

    @Column(name = "experience_level", length = 20) // 경력 수준
    private String experienceLevel;

    @Column(name = "salary_info", length = 100) // 급여 정보
    private String salaryInfo;

    @Column(name = "location", length = 100) // "location" 컬럼과 매핑
    private String location;

    @Column(name = "job_type", length = 30) // 직무 유형
    private String jobType;

    @Enumerated(EnumType.STRING) // Enum 타입을 문자열로 저장
    @Column(name = "status") // 공고 상태
    private JobPostingStatus status;

    @CreatedDate
    @Column(name = "reg_date", updatable = false) // 등록일
    private LocalDateTime regDate;

    @LastModifiedDate
    @Column(name = "mod_date") // 수정일
    private LocalDateTime modDate;

    @Column(name = "hire_count") // 채용 인원
    private Integer hireCount;

    @Column(name = "image_path", length = 255) // 이미지 경로
    private String imagePath;

    @Column(name = "start_date") // 모집 시작일
    private LocalDate startDate;

    @Column(name = "end_date") // 모집 마감일
    private LocalDate endDate;

    @Transient
    private Long previousCUserIdx;

    @PostLoad
    private void recordPreviousCUserIdx() {
        this.previousCUserIdx = this.cUserIdx;
    }

    @PreUpdate
    private void detectCUserIdxChange() {
        if (!Objects.equals(previousCUserIdx, this.cUserIdx)) {
            com.hirepicker.realtime.JobPostingUpdateNotifier.notifyChange(
                    this.postingId,
                    previousCUserIdx,
                    this.cUserIdx);
        }
        this.previousCUserIdx = this.cUserIdx;
    }
}
