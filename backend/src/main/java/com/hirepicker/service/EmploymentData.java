package com.hirepicker.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.hirepicker.dto.CalendarEmpEventDto;
import com.hirepicker.dto.CalendarJobPostingDto;
import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.entity.JobPosting;

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

    // 캘린더용 채용 공고 목록 조회
    List<CalendarJobPostingDto> getAllJobPostingsForCalendar();

    // 캘린더용 채용 행사 목록 조회
    List<CalendarEmpEventDto> getAllEmpEventsForCalendar();

    // 캘린더용 채용 행사 목록 조회 (지역 필터링)
    List<CalendarEmpEventDto> getAllEmpEventsForCalendarByRegions(List<String> regions);

    // 특정 기업의 채용 공고 목록 조회
    List<JobDto> getJobPostingsByCompanyIdx(Long companyIdx);

    // 특정 채용 공고 상세 정보 조회 (ID 기준)
    JobDto getJobPostingById(String postingId);

    // 특정 채용 공고 상세 정보 조회 (인덱스 기준)
    JobDto getJobPostingByPostingIdx(Long postingIdx);

    JobPosting findByPostingIdx(Long postingIdx);
}
