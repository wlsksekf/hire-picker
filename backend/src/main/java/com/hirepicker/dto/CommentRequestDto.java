// CommentRequestDto.java
package com.hirepicker.dto;
import lombok.Data;

@Data
public class CommentRequestDto {
    private Long postIdx;   // 댓글 달 게시글 PK
    private Long pUserIdx;  // 작성자 PK
    private String content; // 댓글 내용
}
