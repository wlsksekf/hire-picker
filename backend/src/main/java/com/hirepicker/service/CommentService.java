package com.hirepicker.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hirepicker.dto.CommentRequestDto;
import com.hirepicker.dto.CommentResponseDto;
import com.hirepicker.entity.Comment;
import com.hirepicker.repository.CommentRepository;
import org.springframework.security.access.AccessDeniedException;

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
        System.out.println("생성된 Comment:"+comment);
        return commentRepository.save(comment);
    }

    // 댓글 수정
    public void updateComment(Long commentIdx, CommentRequestDto dto, Long userId) {
        Comment comment = commentRepository.findById(commentIdx)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        // 권한(본인만) 체크
        if (!comment.getPUserIdx().equals(userId)) {
            throw new AccessDeniedException("본인만 수정가능");
        }
        comment.setContent(dto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }

    // 댓글 삭제
    public void deleteComment(Long commentIdx, Long userId) {
        Comment comment = commentRepository.findById(commentIdx)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        if (!comment.getPUserIdx().equals(userId)) {
            throw new AccessDeniedException("본인만 삭제가능");
        }
        commentRepository.delete(comment);
    }
    
}
