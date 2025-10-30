package com.hirepicker.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column; // 컬럼 설정을 위해 추가
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

    @Id
    private Long post_idx;

    // --- 숫자형 필드 (Long) ---
    private Integer view_count; // 조회수는 Long 또는 Integer가 적절
    
    // board_idx, p_user_idx는 Long 타입으로 수정
    @Column(nullable = false) // DB에서 Not Null 제약 조건 적용
    private Long board_idx; 
    
    @Column(nullable = false) // DB에서 Not Null 제약 조건 적용
    private String p_user_idx; // 사용자 ID는 문자열(String)인 경우가 많아 String으로 유지합니다. (ID가 숫자라면 Long으로 수정)

    // --- 문자열 필드 (String) ---
    // 게시글 제목과 내용은 반드시 String 타입이어야 합니다.
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT") // TEXT 타입으로 설정하여 긴 내용 저장
    private String content;

    // 파일명과 이미지 경로도 반드시 String 타입이어야 합니다.
    private String file_name; // 원본 파일명
    private String img_name;  // 서버 저장 경로/URL

    // --- 날짜/시간 필드 (LocalDateTime) ---
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
}
