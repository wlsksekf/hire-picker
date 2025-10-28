package com.hirepicker.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;

import com.hirepicker.entity.Posts;
import com.hirepicker.result.ResultData;
import com.hirepicker.service.PostService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/api/posts")
@RestController
public class PostController {
    private final PostService postService;

@GetMapping("")
public ResultData<?> getList(@RequestParam(value = "bname", defaultValue = "BBS") String bname,
                             @RequestParam(value = "cPage", defaultValue = "1") int cPage){
    
    // ⭐ 수정: 서비스로부터 Page 객체를 받습니다. ⭐
    Page<Posts> postPage = this.postService.getList(bname, cPage);

    // 1. 실제 게시글 목록 (현재 페이지 10개)
    List<Posts> list = postPage.getContent();
    
    // 2. 전체 게시글 수 (프론트엔드에서 totalPage 계산에 사용)
    long totalCount = postPage.getTotalElements(); // Long 타입입니다.

    String msg = "fail";
    if(list != null && !list.isEmpty())
        msg = "success";

    // ⭐ 수정: 전체 개수(totalCount)와 목록(list)을 함께 반환 ⭐
    // ResultData의 첫 번째 인자(count)를 totalCount로 사용합니다.
    return ResultData.of((int)totalCount, msg, list);
}
}
