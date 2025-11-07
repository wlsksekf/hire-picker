package com.hirepicker.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.JobDto;
import com.hirepicker.dto.SearchFilterDTO;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.repository.JobPostingRepository;
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
        var filters = dto.getFilters();
        List<String> locations = filters.get("location");
        List<String> jobTypes = filters.get("jobType");
        List<String> employmentTypes = filters.get("employmentType");
        List<String> experienceLevels = filters.get("experienceLevel");
        List<String> companyTypes = filters.get("companyType");

        System.out.println("===== 🔍 검색 요청 도착 =====");
        System.out.println("검색어: " + keyword);
        System.out.println("지역: " + locations);
        System.out.println("직종: " + jobTypes);
        System.out.println("고용형태: " + employmentTypes);
        System.out.println("학력: " + experienceLevels);
        System.out.println("기업형태: " + companyTypes);
        System.out.println("============================");

        return employmentDataImpl.jobFilter(dto, pageable);
    }

    @PostMapping("/bookmark/check")
    public Map<String, Object> check(@RequestBody Map<String,Object> body){

        System.out.println("-----------------------------------"+body);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String,Object> m = new HashMap<>();


        // 로그인 안된 경우
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            m.put("LoggedIn", false);
            m.put("bookmark", false); // 북마크 여부 기본값 (예: 로그인 안 되어 있으면 false)
            System.out.println("❌ 로그인 안 된 상태");
            return m;
        }

        JobPosting posting = employmentDataImpl.findByPostingId(String.valueOf(body.get("jobId")));


        String postIdx = String.valueOf(posting.getPostingIdx());

        CustomUserDetails p_user = (CustomUserDetails)auth.getPrincipal();
        String userIdx = String.valueOf(p_user.getId());
        System.out.println(postIdx+"IIDIDIDIDIDIDIDIDIDIDIIDIDID");
        System.out.println(userIdx+"IDXDIXDIXDIXIDXIDXIDXIDIXDIXDIXDIDX");
        boolean isBookmarked = bookMarkService.isBookmarked(userIdx, postIdx);

        System.out.println(isBookmarked+"트루야펄스냐트루냐펄스냐트루냐펄스냐");
        m.put("LoggedIn", true);
        m.put("Bookmarked", isBookmarked);

        return m;
    }

}
