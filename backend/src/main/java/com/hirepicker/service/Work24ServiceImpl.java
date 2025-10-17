package com.hirepicker.service;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.model.Company;
import com.hirepicker.model.EmpEvent;
import com.hirepicker.model.JobPosting;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.EmpEventRepository;
import com.hirepicker.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class Work24ServiceImpl implements Work24Service {

    private final JobPostingRepository jobPostingRepository;
    private final EmpEventRepository empEventRepository;
    private final CompanyRepository companyRepository;

    @Override
    public Page<JobDto> getJobs(Pageable pageable) {
        return jobPostingRepository.findAll(pageable)
                .map(new Function<JobPosting, JobDto>() {
                    @Override
                    public JobDto apply(JobPosting job) {
                        return new JobDto(
                                job.getPostingId(),
                                Optional.ofNullable(job.getCompany()).map(Company::getCompanyName).orElse(""),
                                job.getTitle(),
                                job.getEmploymentType(),
                                job.getLocation()
                        );
                    }
                });
    }

    @Override
    public Page<EventDto> getEvents(Pageable pageable) {
        return empEventRepository.findAll(pageable)
                .map(new Function<EmpEvent, EventDto>() {
                    @Override
                    public EventDto apply(EmpEvent event) {
                        return new EventDto(
                                event.getEventCode(),
                                event.getEventName(),
                                event.getEventDuration(),
                                event.getArea()
                        );
                    }
                });
    }

    @Override
    public Page<CompanyDto> getCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable)
                .map(new Function<Company, CompanyDto>() {
                    @Override
                    public CompanyDto apply(Company company) {
                        return new CompanyDto(
                                company.getCompanyId(),
                                company.getCompanyName(),
                                company.getDescription(),
                                company.getWebsiteUrl(),
                                company.getBusinessNumber(),
                                company.getLogoUrl()
                        );
                    }
                });
    }
}