package com.hirepicker.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

/**
 * 개인회원이 즐겨찾기한 채용공고 정보를 화면에 전달하기 위한 DTO.
 */
@Getter
@Builder
public class PostingBookmarkResponseDto {

    // 채용공고 기본키
    private final Long postingIdx;
    // 채용공고 제목
    private final String title;
    // 기업 기본키
    private final Long companyIdx;
    // 기업명
    private final String companyName;
    // 모집 시작일
    private final LocalDate startDate;
    // 모집 마감일
    private final LocalDate endDate;
    // 공고 상태 (예: OPEN, CLOSED)
    private final String status;
    // 근무지역
    private final String location;
    // 공고 등록일(즐겨찾기 참고용)
    private final LocalDateTime regDate;
}

