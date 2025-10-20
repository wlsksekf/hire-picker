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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class Work24DataProcessorService {

    private final CompanyRepository companyRepository;
    private final JobPostingRepository jobPostingRepository;
    private final EmpEventRepository empEventRepository;

    @Transactional
    public void processJobDto(JobDto dto) {
        Company company = companyRepository.findByCompanyName(dto.companyName())
                .orElseGet(() -> companyRepository.save(Company.builder().companyName(dto.companyName()).build()));

        jobPostingRepository.findByPostingId(dto.id()).ifPresentOrElse(
            p -> {
                p.setTitle(dto.title());
                p.setEmploymentType(dto.employmentType());
                p.setLocation(dto.location());
                jobPostingRepository.save(p);
            },
            () -> jobPostingRepository.save(JobPosting.builder().postingId(dto.id()).company(company).title(dto.title()).employmentType(dto.employmentType()).location(dto.location()).build())
        );
    }

    @Transactional
    public void processEventDto(EventDto dto) {
        empEventRepository.findByEventCode(dto.id()).ifPresentOrElse(
            e -> { e.setEventName(dto.title()); e.setEventDuration(dto.period()); e.setArea(dto.location()); empEventRepository.save(e); },
            () -> empEventRepository.save(EmpEvent.builder().eventCode(dto.id()).eventName(dto.title()).eventDuration(dto.period()).area(dto.location()).build())
        );
    }

    @Transactional
    public void processCompanyDto(CompanyDto dto) {
        companyRepository.findByCompanyId(dto.id()).ifPresentOrElse(
            c -> { c.setCompanyName(dto.name()); c.setDescription(dto.summary()); c.setWebsiteUrl(dto.homepage()); c.setBusinessNumber(dto.businessNumber()); c.setLogoUrl(dto.logoUrl()); companyRepository.save(c); },
            () -> companyRepository.save(Company.builder().companyId(dto.id()).companyName(dto.name()).description(dto.summary()).websiteUrl(dto.homepage()).businessNumber(dto.businessNumber()).logoUrl(dto.logoUrl()).build())
        );
    }
}