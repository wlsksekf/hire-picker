package com.hirepicker.service;

import java.math.BigInteger;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.PostingBookmarkResponseDto;
import com.hirepicker.entity.BookMark.PostingBookMark;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.repository.BookMarkRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookMarkService {

    private final BookMarkRepository bookMarkRepository;

    /**
     * 기존 즐겨찾기 토글 흐름에서 사용하는 메서드(그대로 유지).
     */
    public boolean isBookmarked(String p_user, String postIdx) {
        BigInteger pUserIdx = new BigInteger(p_user);
        BigInteger postingIdx = new BigInteger(postIdx);
        return bookMarkRepository.existsBypUserIdxAndPostingIdx(pUserIdx, postingIdx);
    }

    /**
     * 기존 즐겨찾기 추가 로직.
     */
    public int addBookmark(String userId, String postIdx) {
        if (isBookmarked(userId, postIdx)) {
            return 0;
        }

        PostingBookMark bookmark = new PostingBookMark();
        bookmark.setPUserIdx(new BigInteger(userId));
        bookmark.setPostingIdx(new BigInteger(postIdx));

        bookMarkRepository.save(bookmark);
        return 1;
    }

    /**
     * 기존 즐겨찾기 삭제 로직(문자열 파라미터용).
     */
    public int deleteBookmark(String userId, String postIdx) {
        BigInteger pUserIdx = new BigInteger(userId);
        BigInteger postingIdx = new BigInteger(postIdx);
        return bookMarkRepository.deleteBookmark(pUserIdx, postingIdx);
    }

    /**
     * 추가: 개인회원이 즐겨찾기한 채용공고를 DTO로 변환해 반환.
     */
    @Transactional(readOnly = true)
    public List<PostingBookmarkResponseDto> getBookmarksByUserId(Long userId) {
        BigInteger pUserIdx = BigInteger.valueOf(userId);
        return bookMarkRepository.findBypUserIdx(pUserIdx)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 추가: 개인회원이 특정 공고의 즐겨찾기를 해제(Long 파라미터 버전).
     */
    @Transactional
    public void deleteBookmark(Long userId, Long postingIdx) {
        BigInteger pUserIdx = BigInteger.valueOf(userId);
        BigInteger postIdx = BigInteger.valueOf(postingIdx);
        bookMarkRepository.deleteBookmark(pUserIdx, postIdx);
    }

    /**
     * 내부 변환 로직: 엔티티 → 화면용 DTO.
     */
    private PostingBookmarkResponseDto convertToDto(PostingBookMark bookmark) {
        JobPosting posting = bookmark.getPosting();
        Company company = posting != null ? posting.getCompany() : null;
        return PostingBookmarkResponseDto.builder()
                .postingIdx(posting != null ? posting.getPostingIdx() : null)
                .title(posting != null ? posting.getTitle() : null)
                .companyIdx(company != null ? company.getCompanyIdx() : null)
                .companyName(company != null ? company.getCompanyName() : null)
                .startDate(posting != null ? posting.getStartDate() : null)
                .endDate(posting != null ? posting.getEndDate() : null)
                .status(posting != null && posting.getStatus() != null ? posting.getStatus().name() : null)
                .location(posting != null ? posting.getLocation() : null)
                .regDate(posting != null ? posting.getRegDate() : null)
                .build();
    }
}
