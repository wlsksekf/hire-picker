package com.hirepicker.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class EmploymentDataProcessorService {

    private final CompanyRepository companyRepository; // 기업 리포지토리
    private final JobPostingRepository jobPostingRepository; // 채용 공고 리포지토리
    private final EmpEventRepository empEventRepository; // 채용 행사 리포지토리

    // JobDto를 처리하여 DB에 저장/업데이트
    @Transactional
    public void processJobDto(JobDto dto) {
        Company company = companyRepository.findByCompanyName(dto.companyName())
                .orElseGet(() -> companyRepository.save(Company.builder().companyName(dto.companyName()).build()));

        jobPostingRepository.findByPostingId(dto.id()).ifPresentOrElse(
                p -> { // 이미 존재하는 공고이면 업데이트
                    p.setTitle(dto.title());
                    p.setEmploymentType(dto.employmentType());
                    p.setLocation(dto.location());
                    jobPostingRepository.save(p);
                },
                () -> jobPostingRepository.save(JobPosting.builder().postingId(dto.id()).company(company)
                        .title(dto.title()).employmentType(dto.employmentType()).location(dto.location()).build()) // 새로운
                                                                                                                   // 공고이면
                                                                                                                   // 저장
        );
    }

    // EventDto를 처리하여 DB에 저장/업데이트
    @Transactional
    public void processEventDto(EventDto dto) {
        empEventRepository.findByEventCode(dto.id()).ifPresentOrElse(
                e -> { // 이미 존재하는 행사이면 업데이트
                    e.setEventName(dto.title());
                    e.setEventDuration(dto.period());
                    e.setArea(dto.location());
                    empEventRepository.save(e);
                },
                () -> empEventRepository.save(EmpEvent.builder().eventCode(dto.id()).eventName(dto.title())
                        .eventDuration(dto.period()).area(dto.location()).build()) // 새로운 행사이면 저장
        );
    }

    // CompanyDto를 처리하여 DB에 저장/업데이트
    @Transactional
    public void processCompanyDto(CompanyDto dto) {
        companyRepository.findByCompanyName(dto.name()).ifPresentOrElse(
                c -> { // 이미 존재하는 기업이면 업데이트
                    c.setDescription(dto.summary());
                    c.setWebsiteUrl(dto.homepage());
                    c.setBusinessNumber(dto.businessNumber());
                    c.setLogoUrl(dto.logoUrl());
                    c.setCompanyType(dto.companyType());
                    c.setAddress(dto.adres());
                    c.setCeoName(dto.ceoNm());
                    c.setEmployeeCount(dto.employeeCount());
                    c.setCorpCode(dto.corpCode());
                    companyRepository.save(c);
                },
                () -> companyRepository.save(Company.builder()
                        .companyName(dto.name())
                        .description(dto.summary())
                        .websiteUrl(dto.homepage())
                        .businessNumber(dto.businessNumber())
                        .logoUrl(dto.logoUrl())
                        .companyType(dto.companyType())
                        .address(dto.adres())
                        .ceoName(dto.ceoNm())
                        .employeeCount(dto.employeeCount())
                        .corpCode(dto.corpCode())
                        .build()) // 새로운 기업이면 저장
        );
    }
}