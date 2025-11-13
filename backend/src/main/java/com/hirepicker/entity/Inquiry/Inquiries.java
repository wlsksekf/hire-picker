package com.hirepicker.entity.Inquiry;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

// 1:1 문의 엔티티(inquiries 테이블 매핑)
@Entity
@Table(name = "inquiries")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Inquiries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_idx")
    private Long inquiryIdx; // PK

    @Column(name = "p_user_idx", nullable = false)
    private Long pUserIdx; // 문의자 ID (FK: personal_user)

    @Column(name = "m_user_idx")
    private Long mUserIdx; // 관리자 ID (FK: manage_user)

    @Column(length = 50)
    private String category; // 문의 카테고리

    @Column(nullable = false, length = 255)
    private String title; // 문의 제목

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // 문의 내용

    @Column(columnDefinition = "TEXT")
    private String answerContent; // 답변 내용

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.PENDING; // 문의 상태

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // 작성일

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // 수정일

    // 문의 상태 enum
    public enum InquiryStatus {
        PENDING,    // 대기중
        ANSWERED    // 답변완료
    }
}

