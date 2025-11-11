package com.hirepicker.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "comments")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EntityListeners(AuditingEntityListener.class)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentIdx; // BIGINT, PK, AI

    @Column(nullable = false)
    private Long postIdx; // BIGINT, FK, NN

    @Column
    private Long parentIdx; // 대댓글(최상위면 null)

    @Column(nullable = false)
    private Long pUserIdx; // BIGINT, NN (작성자 FK)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // TEXT, NN

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // TIMESTAMP, 자동등록

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt; // TIMESTAMP, 자동등록

    // Lombok 자동 getter/setter 사용 (수동으로 추가 X)
    // 일관성을 위해 getter에만 JsonProperty를 걸고 싶을 땐 아래처럼!
    @JsonProperty("pUserIdx")
    public Long getPUserIdx() { return pUserIdx; }
    public void setPUserIdx(Long pUserIdx) { this.pUserIdx = pUserIdx; }
}
