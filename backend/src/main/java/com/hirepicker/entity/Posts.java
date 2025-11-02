package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
public class Posts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postIdx;        // BIGINT, PK, AI

    @Column(nullable = false)
    private Long boardIdx;       // BIGINT, NN

    @Column(nullable = false)
    private Long pUserIdx;       // BIGINT, NN

    @Column(nullable = false, length = 255)
    private String title;        // VARCHAR(255), NN

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;      // TEXT, NN

    private Integer viewCount;   // INT, NULL 허용

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;  // TIMESTAMP, 자동등록

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;  // TIMESTAMP, 자동등록

    @Column(length = 50)
    private String fileName;     // VARCHAR(50)

    @Column(length = 50)
    private String imgName;      // VARCHAR(50)
}
