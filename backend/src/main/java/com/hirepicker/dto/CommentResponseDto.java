package com.hirepicker.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data  // Lombok: getter, setter, toString 등 자동 생성
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto {
    private Long commentIdx;     // 댓글 인덱스(PK)
    private Long postIdx;        // 게시글 인덱스(FK)
    private Long parentIdx;      // 부모 댓글 인덱스(대댓글)
    private Long pUserIdx;       // 작성자 인덱스(FK)
    private String nickname;     // 작성자 닉네임 (users 테이블에서 가져옴)
    private String content;      // 댓글 내용
    private LocalDateTime createdAt;   // 작성일시
}
