package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.PostListDto;
import com.hirepicker.entity.Posts;
import com.hirepicker.result.ResultData;
import com.hirepicker.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    /** 인증 상태 확인 (로그인 확인 등) */
    @GetMapping("/me")
    public ResponseEntity<?> checkAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = (auth != null && auth.isAuthenticated() &&
                                   auth.getPrincipal() instanceof CustomUserDetails);
        String username = null;
        Long userId = null;
        String userType = null;
        if (isAuthenticated) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            username = userDetails.getUsername();
            userId = userDetails.getId();
            userType = userDetails.getUserType().name().toLowerCase();
        }
        return ResponseEntity.ok(Map.of(
                "authenticated", isAuthenticated,
                "username", username,
                "id", userId,
                "userType", userType
        ));
    }

    /** 게시글 전체 목록 조회 & 검색 기능 추가 */
    @GetMapping("")
    public ResultData<?> getList(
            @RequestParam(value = "cPage", defaultValue = "1") int cPage,
            @RequestParam(value = "type", required = false, defaultValue = "title") String type,
            @RequestParam(value = "query", required = false, defaultValue = "") String query
    ) {
        // 검색 파라미터 받으면 검색 서비스 호출, 아니면 전체 목록
        Page<PostListDto> postPage = postService.getPostListWithSearch(cPage, type, query);
        List<PostListDto> list = postPage.getContent();
        long totalCount = postPage.getTotalElements();
        int totalPages = postPage.getTotalPages();
        Map<String, Object> data = Map.of(
                "list", list,
                "totalCount", totalCount,
                "totalPages", totalPages,
                "cPage", cPage
        );
        return ResultData.of(1, (list != null && !list.isEmpty()) ? "success" : "fail", data);
    }

    /** 카테고리별 게시글 조회 */
    @GetMapping("/category")
    public ResultData<?> getCategoryList(
            @RequestParam(value = "bname", defaultValue = "all") String bname,
            @RequestParam(value = "cPage", defaultValue = "1") int cPage,
            @RequestParam(value = "boardIdx", defaultValue = "1") Long boardIdx
    ) {
        Page<PostListDto> postPage = postService.getByBoardIdx(bname, cPage, boardIdx);
        List<PostListDto> list = postPage.getContent();
        long totalCount = postPage.getTotalElements();
        int totalPages = postPage.getTotalPages();
        Map<String, Object> data = Map.of(
                "list", list,
                "totalCount", totalCount,
                "totalPages", totalPages,
                "cPage", cPage,
                "boardIdx", boardIdx
        );
        return ResultData.of(1, (list != null && !list.isEmpty()) ? "success" : "fail", data);
    }

    /** 게시글 상세 조회 + 조회수 증가(회원=JWT/userId, 비회원=IP) */
    @GetMapping("/{postIdx}")
    public ResultData<PostListDto> getPost(@PathVariable("postIdx") Long postIdx,
                                           HttpServletRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userKey;

            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
                userKey = "user:" + details.getId();
                log.info("회원 userKey: {}", userKey);
            } else {
                userKey = "ip:" + request.getRemoteAddr();
                log.info("비회원 userKey: {}", userKey);
            }

            PostListDto post = postService.getPostDetailWithNickname(postIdx, userKey);
            String msg = (post != null) ? "success" : "fail";
            return ResultData.of((post != null ? 1 : 0), msg, post);
        } catch (Exception e) {
            log.error("[PostController] Error fetching post detail - PostIdx: {}", postIdx, e);
            return ResultData.of(0, "Error fetching post", null);
        }
    }

    /** 게시글 작성 (로그인 사용자만, 이미지/첨부파일 지원) */
    @PostMapping("/write")
    public ResultData<?> writePost(
            @RequestParam("board_idx") Long board_idx,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @RequestPart(value = "attachment", required = false) MultipartFile attachmentFile
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails)) {
            return ResultData.of(0, "Authentication required. Please login.", null);
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Long pUserIdx = userDetails.getId();
        try {
            Posts newPost = postService.create(board_idx, pUserIdx, title, content, imageFile, attachmentFile);
            return ResultData.of(1, "Post created successfully", newPost);
        } catch (Exception e) {
            log.error("[PostController] Error during post creation", e);
            return ResultData.of(0, "Error during post creation: " + e.getMessage(), null);
        }
    }

    /** 게시글 수정 (파일/이미지 모두 optional) */
    @PutMapping("/{postIdx}/edit")
    public ResultData<?> updatePost(
            @PathVariable("postIdx") Long postIdx,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @RequestPart(value = "attachment", required = false) MultipartFile attachmentFile,
            @RequestParam(value = "deleteImg", required = false) String deleteImg,
            @RequestParam(value = "deleteFile", required = false) String deleteFile
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails)) {
            return ResultData.of(0, "Authentication required.", null);
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Long userId = userDetails.getId();
        try {
            boolean updated = postService.updatePost(
                    postIdx, userId, title, content,
                    imageFile, attachmentFile,
                    "1".equals(deleteImg),
                    "1".equals(deleteFile)
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

    /** 게시글 삭제 (글 + S3 파일/이미지 삭제) */
    @DeleteMapping("/{postIdx}")
    public ResultData<?> deletePost(@PathVariable("postIdx") Long postIdx) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails)) {
            return ResultData.of(0, "Authentication required.", null);
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        Long userId = userDetails.getId();
        try {
            boolean deleted = postService.deletePostWithFiles(postIdx, userId);
            if (deleted) {
                return ResultData.of(1, "success", null);
            } else {
                return ResultData.of(0, "글이 없거나 권한 없음", null);
            }
        } catch (Exception e) {
            log.error("[PostController] Error during post delete", e);
            return ResultData.of(0, "Error during delete: " + e.getMessage(), null);
        }
    }
}
