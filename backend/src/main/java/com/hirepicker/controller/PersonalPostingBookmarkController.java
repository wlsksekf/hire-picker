package com.hirepicker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.PostingBookmarkResponseDto;
import com.hirepicker.service.BookMarkService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 개인회원의 채용공고 즐겨찾기 목록/삭제 전용 컨트롤러.
 */
@Tag(name = "즐겨찾기", description = "채용공고 즐겨찾기 관련 API")
@RestController
@RequestMapping("/api/personal/posting-bookmarks")
@RequiredArgsConstructor
public class PersonalPostingBookmarkController {

    private final BookMarkService bookMarkService;

    /**
     * 로그인한 개인회원의 즐겨찾기 채용공고 목록을 반환.
     */
    @Operation(summary = "즐겨찾기 목록 조회", description = "로그인한 개인회원의 즐겨찾기한 채용공고 목록을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping
    public ResponseEntity<List<PostingBookmarkResponseDto>> getBookmarks(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long personalUserId = userDetails.getId();
        List<PostingBookmarkResponseDto> bookmarks = bookMarkService.getBookmarksByUserId(personalUserId);
        return ResponseEntity.ok(bookmarks);
    }

    /**
     * 특정 채용공고의 즐겨찾기를 해제.
     */
    @Operation(summary = "즐겨찾기 삭제", description = "특정 채용공고의 즐겨찾기를 해제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @DeleteMapping("/{postingIdx}")
    public ResponseEntity<Void> deleteBookmark(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "채용공고 ID", required = true) @PathVariable("postingIdx") Long postingIdx) {
        Long personalUserId = userDetails.getId();
        bookMarkService.deleteBookmark(personalUserId, postingIdx);
        return ResponseEntity.noContent().build();
    }
}

