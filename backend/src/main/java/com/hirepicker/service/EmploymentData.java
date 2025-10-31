package com.hirepicker.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;

// 채용 데이터 관련 비즈니스 로직을 정의하는 인터페이스
public interface EmploymentData {
    // 채용 공고 목록 조회
    Page<JobDto> getJobs(Pageable pageable);

    // 채용 행사 목록 조회
    Page<EventDto> getEvents(Pageable pageable);

    // 기업 목록 조회 (검색 기능 포함)
    Page<CompanyDto> getCompanies(String query, Pageable pageable);

    // 특정 기업 상세 정보 조회
    CompanyDto getCompany(Long companyIdx);
}
