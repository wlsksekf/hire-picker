package com.hirepicker.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.dto.CommentRequestDto;
import com.hirepicker.dto.CommentResponseDto;
import com.hirepicker.entity.Comment;
import com.hirepicker.service.CommentService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
      System.out.println("댓글 작성 요청: " + dto); // <-- dto 값 확인!
       System.out.println("content 값: " + dto.getContent());
    return commentService.writeComment(dto);
}

}
