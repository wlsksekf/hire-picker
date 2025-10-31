package com.hirepicker.service;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.EmpEvent;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.EmpEventRepository;
import com.hirepicker.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageImpl;


import java.util.Optional;

@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class EmploymentDataImpl implements EmploymentData {

    private final JobPostingRepository jobPostingRepository; // 채용 공고 리포지토리
    private final EmpEventRepository empEventRepository; // 채용 행사 리포지토리
    private final CompanyRepository companyRepository; // 기업 리포지토리

    // 채용 공고 목록 조회
    @Override
    public Page<JobDto> getJobs(Pageable pageable) {
    
    Page<JobPosting> jobPostings = jobPostingRepository.findAll(pageable);
    
    List<JobDto> jobDtos = new ArrayList<>();
    for (JobPosting job : jobPostings.getContent()) {
        
        String companyName = "";
        if (job.getCompany() != null) {
            companyName = job.getCompany().getCompanyName();
        }
        
        JobDto jobDto = JobDto.builder()
                .id(job.getPostingId())
                .companyName(companyName)
                .title(job.getTitle())
                .employmentType(job.getEmploymentType())
                .location(job.getLocation())
                .imgUrl(job.getCompany().getImgPath())
                .build();
        
        
        jobDtos.add(jobDto);
    }
    
    return new PageImpl<>(jobDtos, pageable, jobPostings.getTotalElements());
    
    }

    // 채용 행사 목록 조회
    @Override
    public Page<EventDto> getEvents(Pageable pageable) {
        Page<EmpEvent> empEvents = empEventRepository.findAll(pageable);
        
        List<EventDto> eventDtos = new ArrayList<>();
        for (EmpEvent event : empEvents.getContent()) {
            EventDto eventDto = convertToEventDto(event);
            eventDtos.add(eventDto);
        }
        
        return new PageImpl<>(eventDtos, pageable, empEvents.getTotalElements());
    }

    // EmpEvent 엔티티를 EventDto로 변환
    private static EventDto convertToEventDto(EmpEvent event) {
        return new EventDto(
                event.getEventCode(),
                event.getEventName(),
                event.getEventDuration(),
                event.getArea()
        );
    }

    // 기업 목록 조회
    @Override
    public Page<CompanyDto> getCompanies(String query, Pageable pageable) {
        Page<Company> companies;

        if (query != null && !query.trim().isEmpty()) {
            companies = companyRepository.findByCompanyNameContainingIgnoreCase(query, pageable);
        } else {
            companies = companyRepository.findAll(pageable);
        }
        
        List<CompanyDto> companyDtos = new ArrayList<>();
        for (Company company : companies.getContent()) {
            CompanyDto companyDto = convertToCompanyDto(company);
            companyDtos.add(companyDto);
        }
        
        return new PageImpl<>(companyDtos, pageable, companies.getTotalElements());
    }

    // 특정 기업 상세 정보 조회
    @Override
    public CompanyDto getCompany(String id) {
        Optional<Company> companyOptional = companyRepository.findByCompanyId(id);
            Company company = companyOptional.get();
            return convertToCompanyDto(company);
    }

    // Company 엔티티를 CompanyDto로 변환
    private static CompanyDto convertToCompanyDto(Company company) {
        return new CompanyDto(
                company.getCompanyId(),
                company.getCompanyName(),
                company.getDescription(),
                company.getWebsiteUrl(),
                company.getBusinessNumber(),
                company.getLogoUrl(),
                company.getCompanyType(),
                company.getCeoName(),
                company.getAddress(),
                company.getEmployeeCount(),
                company.getCorpCode()
        );
    }

}
