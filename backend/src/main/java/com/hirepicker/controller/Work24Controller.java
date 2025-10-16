package com.hirepicker.controller;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.model.Company;
import com.hirepicker.model.EmpEvent;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.EmpEventRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.service.Work24ApiService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/work24")
public class Work24Controller {

    private final JobPostingRepository jobPostingRepository;
    private final EmpEventRepository empEventRepository;
    private final CompanyRepository companyRepository;
    private final Work24ApiService work24ApiService;

    public Work24Controller(JobPostingRepository jobPostingRepository, EmpEventRepository empEventRepository, CompanyRepository companyRepository, Work24ApiService work24ApiService) {
        this.jobPostingRepository = jobPostingRepository;
        this.empEventRepository = empEventRepository;
        this.companyRepository = companyRepository;
        this.work24ApiService = work24ApiService;
    }

    // --- 데이터 조회 API (페이지네이션 적용) --- //

    @GetMapping("/jobs")
    public Page<JobDto> getJobs(Pageable pageable) {
        return jobPostingRepository.findAll(pageable)
                .map(job -> new JobDto(
                        job.getPostingId(),
                        Optional.ofNullable(job.getCompany()).map(Company::getCompanyName).orElse(""),
                        job.getTitle(),
                        job.getEmploymentType(),
                        job.getLocation()
                ));
    }

    @GetMapping("/events")
    public Page<EventDto> getEvents(Pageable pageable) {
        return empEventRepository.findAll(pageable)
                .map(event -> new EventDto(
                        event.getEventCode(),
                        event.getEventName(),
                        event.getEventDuration(),
                        event.getArea()
                ));
    }

    @GetMapping("/companies")
    public Page<CompanyDto> getCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable)
                .map(company -> new CompanyDto(
                        company.getCompanyId(),
                        company.getCompanyName(),
                        company.getDescription(),
                        company.getWebsiteUrl(),
                        company.getBusinessNumber(),
                        company.getLogoUrl()
                ));
    }

    // --- 수동 동기화 트리거 API --- //

    @GetMapping("/sync/jobs")
    public ResponseEntity<String> syncJobs() {
        work24ApiService.synchronizePublicJobs();
        return ResponseEntity.ok("Job synchronization triggered!");
    }

    @GetMapping("/sync/events")
    public ResponseEntity<String> syncEvents() {
        work24ApiService.synchronizeEvents();
        return ResponseEntity.ok("Event synchronization triggered!");
    }

    @GetMapping("/sync/companies")
    public ResponseEntity<String> syncCompanies() {
        work24ApiService.synchronizeCompanies();
        return ResponseEntity.ok("Company synchronization triggered!");
    }
}