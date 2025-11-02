package com.hirepicker.controller;

import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import com.hirepicker.entity.Posts;
import com.hirepicker.result.ResultData;
import com.hirepicker.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

@RequiredArgsConstructor
@RequestMapping("/api/posts")
@RestController
public class PostController {
    private final PostService postService;

    // 게시글 작성 (POST): /api/posts/write
    @PostMapping("/write")
    public ResultData<?> writePost(
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam("pUserIdx") Long pUserIdx, // 카멜케이스로 변경
        @RequestPart(value = "image", required = false) MultipartFile imageFile,
        Principal principal 
    ) {
        if (principal == null) {
            return ResultData.of(0, "Authentication required", null);
        }

        // 프론트의 FormData 파라미터명도 반드시 pUserIdx로 변경할 것!
        Posts newPost;
        try {
            newPost = this.postService.create(pUserIdx, title, content, imageFile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResultData.of(0, "Error during post creation: " + e.getMessage(), null);
        }
        return ResultData.of(1, "Post created successfully", newPost);
    }

    // 게시글 목록 조회
    @GetMapping("")
    public ResultData<?> getList(
            @RequestParam(value = "bname", defaultValue = "BBS") String bname,
            @RequestParam(value = "cPage", defaultValue = "1") int cPage){
        Page<Posts> postPage = this.postService.getList(bname, cPage);

        List<Posts> list = postPage.getContent();
        long totalCount = postPage.getTotalElements();

        String msg = "fail";
        if(list != null && !list.isEmpty())
            msg = "success";

        return ResultData.of((int)totalCount, msg, list);
    }

    // 게시글 상세 조회
    @GetMapping("/{postIdx}") // URL Path도 카멜케이스로 변경 가능
    public ResultData<Posts> getPost(@PathVariable("postIdx") Long postIdx) {
        Posts post = this.postService.getPost(postIdx);
        String msg = (post != null) ? "success" : "fail";
        return ResultData.of((post != null ? 1 : 0), msg, post);
    }
}
