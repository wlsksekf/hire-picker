package com.hirepicker.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.hirepicker.dto.JobDto;
import com.hirepicker.dto.SearchFilterDTO;
import com.hirepicker.service.EmploymentDataImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SearchControl {

    private final EmploymentDataImpl employmentDataImpl;

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
}
