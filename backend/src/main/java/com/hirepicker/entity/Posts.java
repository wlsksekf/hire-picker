package com.hirepicker.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column; 
import jakarta.persistence.GeneratedValue; // PK 자동 증가를 위해 필요 (선택)
import jakarta.persistence.GenerationType; // PK 자동 증가 전략을 위해 필요 (선택)

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
public class Posts {

    // PK 설정: DB 컬럼 이름 명시 및 자동 증가 설정 추가
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB의 자동 증가 기능을 사용
    @Column(name = "post_idx") // ⭐ DB 컬럼: post_idx
    private Long postIdx; // ⭐ Java 필드: postIdx (카멜 케이스)

    // --- 숫자형 필드 ---
    @Column(name = "view_count") // ⭐ DB 컬럼: view_count
    private Integer viewCount; // ⭐ Java 필드: viewCount
    
    // 게시판 ID (가장 먼저 수정했던 필드)
    @Column(name = "board_idx", nullable = false) // ⭐ DB 컬럼: board_idx
    private Long boardIdx; // ⭐ Java 필드: boardIdx
    
    // 사용자 ID
    @Column(name = "p_user_idx", nullable = false) // ⭐ DB 컬럼: p_user_idx
    private String pUserIdx; // ⭐ Java 필드: pUserIdx

    // --- 문자열 필드 (제목, 내용) ---
    @Column(nullable = false, length = 255)
    private String title; // (Snake Case와 동일하므로 @Column 생략 가능하나, 일관성을 위해 유지 가능)
    
    @Column(nullable = false, columnDefinition = "TEXT") 
    private String content; // (Snake Case와 동일하므로 @Column 생략 가능하나, 일관성을 위해 유지 가능)

    // 파일 관련 필드
    @Column(name = "file_name") // ⭐ DB 컬럼: file_name
    private String fileName; // ⭐ Java 필드: fileName
    
    @Column(name = "img_name") // ⭐ DB 컬럼: img_name
    private String imgName;  // ⭐ Java 필드: imgName

    // --- 날짜/시간 필드 ---
    // @CreatedDate/@LastModifiedDate 어노테이션을 사용하는 것이 이상적이나, 명시적 매핑을 위해 @Column 사용
    @Column(name = "created_at") // ⭐ DB 컬럼: created_at
    private LocalDateTime createdAt; // ⭐ Java 필드: createdAt
    
    @Column(name = "updated_at") // ⭐ DB 컬럼: updated_at
    private LocalDateTime updatedAt; // ⭐ Java 필드: updatedAt
}