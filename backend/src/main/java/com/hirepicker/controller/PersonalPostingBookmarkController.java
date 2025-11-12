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

import lombok.RequiredArgsConstructor;

/**
 * 개인회원의 채용공고 즐겨찾기 목록/삭제 전용 컨트롤러.
 */
@RestController
@RequestMapping("/api/personal/posting-bookmarks")
@RequiredArgsConstructor
public class PersonalPostingBookmarkController {

    private final BookMarkService bookMarkService;

    /**
     * 로그인한 개인회원의 즐겨찾기 채용공고 목록을 반환.
     */
    @GetMapping
    public ResponseEntity<List<PostingBookmarkResponseDto>> getBookmarks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long personalUserId = userDetails.getId();
        List<PostingBookmarkResponseDto> bookmarks = bookMarkService.getBookmarksByUserId(personalUserId);
        return ResponseEntity.ok(bookmarks);
    }

    /**
     * 특정 채용공고의 즐겨찾기를 해제.
     */
    @DeleteMapping("/{postingIdx}")
    public ResponseEntity<Void> deleteBookmark(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("postingIdx") Long postingIdx) {
        Long personalUserId = userDetails.getId();
        bookMarkService.deleteBookmark(personalUserId, postingIdx);
        return ResponseEntity.noContent().build();
    }
}

