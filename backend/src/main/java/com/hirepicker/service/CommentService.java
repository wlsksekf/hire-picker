package com.hirepicker.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hirepicker.dto.CommentRequestDto;
import com.hirepicker.dto.CommentResponseDto;
import com.hirepicker.entity.Comment;
import com.hirepicker.repository.CommentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;

public List<CommentResponseDto> getCommentsWithNicknames(Long postIdx) {
    return commentRepository.findCommentsWithNicknameByPostIdx(postIdx);
}

public Comment writeComment(CommentRequestDto dto) {
        Comment comment = Comment.builder()
            .postIdx(dto.getPostIdx())
            .pUserIdx(dto.getPUserIdx())
            .content(dto.getContent())
            .build();
        // createdAt 등은 @CreatedDate 자동처리
        return commentRepository.save(comment);
    }


    
}
