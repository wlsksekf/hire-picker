package com.hirepicker.service;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface Work24Service {
    Page<JobDto> getJobs(Pageable pageable);
    Page<EventDto> getEvents(Pageable pageable);
    Page<CompanyDto> getCompanies(String query, Pageable pageable);
    CompanyDto getCompany(String id);
}
