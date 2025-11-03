package com.hirepicker.controller;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.Posts;
import com.hirepicker.result.ResultData;
import com.hirepicker.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/posts")
@RestController
public class PostController {
    private final PostService postService;

    /**
     * ★ 1번 순서: 인증 상태 확인 (구체적인 경로를 먼저 정의!)
     * /api/posts/me 요청이 /api/posts/{postIdx}로 매칭되는 것을 방지
     */
@GetMapping("/me")
public ResponseEntity<?> checkAuthentication() {
    try {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        boolean isAuthenticated = authentication != null 
            && authentication.isAuthenticated() 
            && !(authentication instanceof AnonymousAuthenticationToken);

        String username = isAuthenticated ? authentication.getName() : null;

        log.info("[PostController] Auth Check - Authenticated: {}, Username: {}", isAuthenticated, username);

        return ResponseEntity.ok(Map.of(
            "authenticated", isAuthenticated,
            "username", username
        ));
    } catch (Exception e) {
        log.error("[PostController] Exception in /api/posts/me", e);
        // 500이 아니라 401(권한없음)나 400 등 클라이언트 오류로 적절히 안내
        return ResponseEntity.status(401).body(Map.of(
            "authenticated", false,
            "error", "인증 정보 없음 or 서버 에러: " + e.getMessage()
        ));
    }
}

    

    /**
     * ★ 2번 순서: 게시글 작성 (로그인 사용자만)
     */
    @PostMapping("/write")
    public ResultData<?> writePost(
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam("pUserIdx") Long pUserIdx,
        @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        // 인증 정보 확인
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null 
            || !authentication.isAuthenticated() 
            || authentication instanceof AnonymousAuthenticationToken) {
            
            log.warn("[PostController] Unauthorized write attempt");
            return ResultData.of(0, "Authentication required. Please login.", null);
        }
        
        String authenticatedUsername = authentication.getName();
        log.info("[PostController] Write Post - User: {}, UserIdx: {}", authenticatedUsername, pUserIdx);
        
        Posts newPost;
        try {
            newPost = this.postService.create(pUserIdx, title, content, imageFile);
            log.info("[PostController] Post created successfully - PostIdx: {}", newPost.getPostIdx());
        } catch (Exception e) {
            log.error("[PostController] Error during post creation", e);
            return ResultData.of(0, "Error during post creation: " + e.getMessage(), null);
        }
        
        return ResultData.of(1, "Post created successfully", newPost);
    }

    /**
     * ★ 3번 순서: 게시글 목록 조회 (비회원도 조회 가능)
     */
    @GetMapping("")
    public ResultData<?> getList(
        @RequestParam(value = "bname", defaultValue = "BBS") String bname,
        @RequestParam(value = "cPage", defaultValue = "1") int cPage
    ) {
        try {
            Page<PostListDto> postPage = postService.getPostListWithNickname(bname, cPage);
            List<PostListDto> list = postPage.getContent();
            long totalCount = postPage.getTotalElements();
            int totalPages = postPage.getTotalPages();

            String msg = (list != null && !list.isEmpty()) ? "success" : "fail";
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("list", list != null ? list : new java.util.ArrayList<>());
            data.put("totalCount", totalCount);
            data.put("totalPages", totalPages);
            data.put("cPage", cPage);

            return ResultData.of(1, msg, data);
        } catch (Exception e) {
            log.error("[PostController] Error fetching post list", e);
            return ResultData.of(0, "Error fetching posts", null);
        }
    }

    /**
     * ★ 4번 순서: 게시글 상세 조회 (비회원도 조회 가능)
     * 이 메서드는 마지막에 정의해야 {postIdx}가 다른 경로와 충돌하지 않음
     */
    @GetMapping("/{postIdx}")
    public ResultData<PostListDto> getPost(@PathVariable("postIdx") Long postIdx) {
        try {
            PostListDto post = this.postService.getPostDetailWithNickname(postIdx);
            String msg = (post != null) ? "success" : "fail";
            return ResultData.of((post != null ? 1 : 0), msg, post);
        } catch (Exception e) {
            log.error("[PostController] Error fetching post detail - PostIdx: {}", postIdx, e);
            return ResultData.of(0, "Error fetching post", null);
        }
    }
}
