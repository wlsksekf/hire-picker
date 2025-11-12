package com.hirepicker.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.CommentRequestDto;
import com.hirepicker.dto.CommentResponseDto;
import com.hirepicker.entity.Comment;
import com.hirepicker.service.CommentService;


import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;




@RequiredArgsConstructor
@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentService commentService ;

@GetMapping("")
public List<CommentResponseDto> getComments(@RequestParam("post_idx") Long postIdx) {
    
    return commentService.getCommentsWithNicknames(postIdx);
}

@PostMapping("")
public Comment writeComment(@RequestBody CommentRequestDto dto) {

    return commentService.writeComment(dto);
}


    @PutMapping("/{commentIdx}")
    public ResponseEntity<?> updateComment(
        @PathVariable("commentIdx") Long commentIdx,
        @RequestBody CommentRequestDto dto,
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        commentService.updateComment(commentIdx, dto, userDetails.getId());
        return ResponseEntity.ok().body("success");
    }

    @DeleteMapping("/{commentIdx}")
    public ResponseEntity<?> deleteComment(
        @PathVariable("commentIdx") Long commentIdx,
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        commentService.deleteComment(commentIdx, userDetails.getId());
        return ResponseEntity.ok().body("success");
    }
}
