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

@Service
@RequiredArgsConstructor
public class Work24ServiceImpl implements Work24Service {

    private final JobPostingRepository jobPostingRepository;
    private final EmpEventRepository empEventRepository;
    private final CompanyRepository companyRepository;

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
                .build();
        
        
        jobDtos.add(jobDto);
    }
    
    return new PageImpl<>(jobDtos, pageable, jobPostings.getTotalElements());
    
    }

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

    private static EventDto convertToEventDto(EmpEvent event) {
        return new EventDto(
                event.getEventCode(),
                event.getEventName(),
                event.getEventDuration(),
                event.getArea()
        );
    }

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

    @Override
    public CompanyDto getCompany(String id) {
        Optional<Company> companyOptional = companyRepository.findByCompanyId(id);
            Company company = companyOptional.get();
            return convertToCompanyDto(company);
    }

    private static CompanyDto convertToCompanyDto(Company company) {
        return new CompanyDto(
                company.getCompanyId(),
                company.getCompanyName(),
                company.getDescription(),
                company.getWebsiteUrl(),
                company.getBusinessNumber(),
                company.getLogoUrl(),
                company.getCompanyType()
        );
    }

}
