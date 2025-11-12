package com.hirepicker.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.JobDto;
import com.hirepicker.dto.SearchFilterDTO;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.service.BookMarkService;
import com.hirepicker.service.EmploymentDataImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SearchControl {

    private final EmploymentDataImpl employmentDataImpl;
    private final BookMarkService bookMarkService;

    @PostMapping("/search")
    public Page<JobDto> filter(@RequestBody(required = false) SearchFilterDTO dto, Pageable pageable) {
        // ✅ dto가 null인 경우 (초기 로드 시 전체 조회)
        if (dto == null) {
            System.out.println("===== 🔍 기본 전체 조회 요청 =====");
            return employmentDataImpl.getJobs(pageable);
        }

        String keyword = dto.getSearchTerm();
        Map<String, List<String>> filters = dto.getFilters() == null
                ? Map.of()
                : dto.getFilters();
        List<String> locations = filters.get("location");
        List<String> jobTypes = filters.get("jobType");
        List<String> employmentTypes = filters.get("employmentType");
        List<String> experienceLevels = filters.get("experienceLevel");
        List<String> companyTypes = filters.get("companyType");
        List<String> sources = filters.get("source");
        String dateStatus = filters.containsKey("dateStatus") && !filters.get("dateStatus").isEmpty()
                ? filters.get("dateStatus").get(0)
                : null;

        System.out.println("===== 🔍 검색 요청 도착 =====");
        System.out.println("검색어: " + keyword);
        System.out.println("지역: " + locations);
        System.out.println("직종: " + jobTypes);
        System.out.println("고용형태: " + employmentTypes);
        System.out.println("학력: " + experienceLevels);
        System.out.println("기업형태: " + companyTypes);
        System.out.println("공고 출처: " + sources);
        System.out.println("날짜 상태: " + dateStatus);
        System.out.println("============================");

        return employmentDataImpl.jobFilter(dto, pageable, dateStatus);
    }

    @PostMapping("/bookmark/check")
    public Map<String, Object> check(@RequestBody Map<String, Object> body) {

        System.out.println("-----------------------------------" + body);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> m = new HashMap<>();

        // 로그인 안된 경우
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            m.put("LoggedIn", false);
            m.put("Bookmarked", false); // 북마크 여부 기본값 (예: 로그인 안 되어 있으면 false)
            System.out.println("❌ 로그인 안 된 상태");
            return m;
        }

        // 로그인 된 경우
        Object jobIdObj = body.get("jobId");
        if (jobIdObj == null) {
            m.put("success", false);
            m.put("message", "jobId가 요청에 없습니다.");
            return m;
        }

        JobPosting posting = employmentDataImpl.findByPostingIdx(Long.valueOf(String.valueOf(jobIdObj)));
        String postIdx = String.valueOf(posting.getPostingIdx());

        CustomUserDetails p_user = (CustomUserDetails) auth.getPrincipal();
        String userIdx = String.valueOf(p_user.getId());

        boolean isBookmarked = bookMarkService.isBookmarked(userIdx, postIdx);

        m.put("LoggedIn", true);
        m.put("Bookmarked", isBookmarked);

        return m;
    }

    @PostMapping("/bookmark/toggle")
    public Map<String, Object> toggle(@RequestBody Map<String, Object> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> m = new HashMap<>();

        // 1. 로그인 여부 확인
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            m.put("success", false);
            m.put("message", "로그인이 필요합니다.");
            return m; // Map을 바로 반환 (HTTP Status: 200 OK)
        }

        try {
            // 2. 사용자 ID 및 게시물 ID 추출
            Object jobIdObj = body.get("jobId");
            if (jobIdObj == null) {
                m.put("success", false);
                m.put("message", "jobId가 요청에 없습니다.");
                return m;
            }
            JobPosting posting = employmentDataImpl.findByPostingIdx(Long.valueOf(String.valueOf(jobIdObj)));

            String postIdx = String.valueOf(posting.getPostingIdx());
            CustomUserDetails p_user = (CustomUserDetails) auth.getPrincipal();
            String userIdx = String.valueOf(p_user.getId());

            // 3. 현재 북마크 상태 확인
            boolean isBookmarked = bookMarkService.isBookmarked(userIdx, postIdx);

            // 4. 상태에 따라 토글(추가/삭제) 실행
            if (isBookmarked) {
                // 이미 북마크 되어있음 -> 삭제
                bookMarkService.deleteBookmark(userIdx, postIdx);
                m.put("Bookmarked", false); // 프런트엔드로 보낼 새로운 상태
                m.put("message", "북마크에서 삭제되었습니다.");
            } else {
                // 북마크 안 되어있음 -> 추가
                bookMarkService.addBookmark(userIdx, postIdx);
                m.put("Bookmarked", true); // 프런트엔트로 보낼 새로운 상태
                m.put("message", "북마크에 추가되었습니다.");
            }

            m.put("success", true);
            return m; // Map을 바로 반환 (HTTP Status: 200 OK)

        } catch (Exception e) {
            // 오류 로그 기록
            System.err.println("북마크 처리 중 오류 발생: " + e.getMessage());

            m.put("success", false);
            m.put("message", "북마크 처리 중 서버 내부 오류가 발생했습니다.");
            return m; // Map을 바로 반환 (HTTP Status: 200 OK)
        }
    }
}
