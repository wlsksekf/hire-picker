package com.hirepicker.controller;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;

import com.hirepicker.config.security.CustomUserDetails;
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

    /** 인증 상태 확인 */
    @GetMapping("/me")
    public ResponseEntity<?> checkAuthentication() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAuthenticated = authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
            String username = isAuthenticated ? authentication.getName() : null;
            // ★ userId 추출 로직 추가!
            Long userId = null;
            if (isAuthenticated && authentication.getPrincipal() instanceof CustomUserDetails) {
                userId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        }
            log.info("[PostController] Auth Check - Authenticated: {}, Username: {}", isAuthenticated, username);

            return ResponseEntity.ok(Map.of(
                "authenticated", isAuthenticated,
                "username", username,
                "id", userId
            ));
        } catch (Exception e) {
            log.error("[PostController] Exception in /api/posts/me", e);
            return ResponseEntity.status(401).body(Map.of(
                "authenticated", false,
                "error", "인증 정보 없음 or 서버 에러: " + e.getMessage()
            ));
        }
    }

    /** 게시글 작성 (로그인 사용자만) - 첨부파일, 이미지 모두 지원 */
    @PostMapping("/write")
    public ResultData<?> writePost(
        @RequestParam("board_idx") Long board_idx,
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestPart(value = "image", required = false) MultipartFile imageFile,
        @RequestPart(value = "attachment", required = false) MultipartFile attachmentFile // 첨부파일 추가!
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
log.info("ImageFile: {}", imageFile != null ? imageFile.getOriginalFilename() : "null");
log.info("AttachmentFile: {}", attachmentFile != null ? attachmentFile.getOriginalFilename() : "null");

        if (authentication == null
            || !authentication.isAuthenticated()
            || authentication instanceof AnonymousAuthenticationToken) {
            log.warn("[PostController] Unauthorized write attempt");
            return ResultData.of(0, "Authentication required. Please login.", null);
        }

        Long pUserIdx = userDetails.getId();
        Posts newPost;
        try {
            // PostService에 첨부파일/이미지 모두 전달
            newPost = this.postService.create(board_idx, pUserIdx, title, content, imageFile, attachmentFile);
            log.info("[PostController] Post created successfully - PostIdx: {}", newPost.getPostIdx());
        } catch (Exception e) {
            log.error("[PostController] Error during post creation", e);
            return ResultData.of(0, "Error during post creation: " + e.getMessage(), null);
        }

        return ResultData.of(1, "Post created successfully", newPost);
    }

    /** 게시글 목록 조회 (비회원 가능) */
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

    /** 게시글 상세 조회 (비회원 가능) */
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

      @PutMapping("/{postIdx}/edit")
    public ResultData<?> updatePost(
        @PathVariable("postIdx") Long postIdx,
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        // 파일/이미지 모두 optional
        @RequestPart(value = "image", required = false) MultipartFile imageFile,
        @RequestPart(value = "attachment", required = false) MultipartFile attachmentFile,
        @RequestParam(value = "deleteImg", required = false) String deleteImg,
        @RequestParam(value = "deleteFile", required = false) String deleteFile,
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getId();

        try {
            boolean updated = postService.updatePost(
                postIdx, userId, title, content,
                imageFile, attachmentFile,
                "1".equals(deleteImg),  // true면 이미지 삭제 요청
                "1".equals(deleteFile)  // true면 첨부파일 삭제 요청
            );
            if (updated) {
                return ResultData.of(1, "success", null);
            } else {
                return ResultData.of(0, "권한 없음 또는 글 없음", null);
            }
        } catch (Exception e) {
            log.error("[PostController] Error during post update", e);
            return ResultData.of(0, "Error during post update: " + e.getMessage(), null);
        }
    }

    @DeleteMapping("/{postIdx}")
    public ResultData<?> deletePost(@PathVariable("postIdx") Long postIdx,
                                @AuthenticationPrincipal CustomUserDetails userDetails) {
    Long userId = userDetails.getId();
    try {
        boolean deleted = postService.deletePostWithFiles(postIdx, userId);
        if (deleted) return ResultData.of(1, "success", null);
        else return ResultData.of(0, "글이 없거나 권한 없음", null);
    } catch (Exception e) {
        log.error("[PostController] Error during post delete", e);
        return ResultData.of(0, "Error during delete: " + e.getMessage(), null);
    }
}

}
