package com.hirepicker.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostListDto {
    private Long postIdx;
    private Long pUserIdx;  
    private String nickname;    // 글쓴이 닉네임
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private Integer viewCount;
    private String imgName;
    private String fileName;

}
