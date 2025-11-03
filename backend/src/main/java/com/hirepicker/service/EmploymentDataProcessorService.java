package com.hirepicker.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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
import lombok.extern.slf4j.Slf4j;

@Slf4j // Slf4j 어노테이션 추가
@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class EmploymentDataProcessorService {

    private final CompanyRepository companyRepository; // 기업 리포지토리
    private final JobPostingRepository jobPostingRepository; // 채용 공고 리포지토리
    private final EmpEventRepository empEventRepository; // 채용 행사 리포지토리

    // JobDto를 처리하여 DB에 저장/업데이트
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processJobDto(JobDto dto) {
        // 회사명이 중복되어 있을 수 있으므로 findAllByCompanyName 사용
        java.util.List<Company> matchedCompanies = companyRepository.findAllByCompanyName(dto.companyName());
        Company company;
        if (matchedCompanies.isEmpty()) {
            company = companyRepository.save(Company.builder().companyName(dto.companyName()).build());
        } else {
            if (matchedCompanies.size() > 1) {
                // 중복 레코드가 있는 경우 경고 로그를 남기고 첫 번째 레코드를 사용
                System.err.println("Warning: multiple companies found with name='" + dto.companyName()
                        + "'. Using the first match.");
            }
            company = matchedCompanies.get(0);
        }

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
    @Transactional(propagation = Propagation.REQUIRES_NEW)
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
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processCompanyDto(CompanyDto dto) {
        java.util.List<Company> matches = companyRepository.findAllByCompanyName(dto.name());
        if (!matches.isEmpty()) {
            Company c = matches.get(0);
            if (matches.size() > 1) {
                System.err.println(
                        "Warning: multiple companies found for name='" + dto.name() + "'. Updating first match.");
            }
            // 이미 존재하는 기업이면 업데이트
            // Only update fields when incoming values are non-null/non-empty to avoid
            // overwriting existing DB values with empty strings (which may cause
            // SQL errors for numeric columns).
            c.setStatus("approved"); // status를 approved로 설정
            c.setRegDate(new java.util.Date()); // regDate를 현재 날짜로 설정
            if (dto.summary() != null && !dto.summary().isBlank()) {
                c.setDescription(dto.summary());
            }
            if (dto.homepage() != null && !dto.homepage().isBlank()) {
                c.setWebsiteUrl(dto.homepage());
            }
            if (dto.businessNumber() != null && !dto.businessNumber().isBlank()) {
                c.setBusinessNumber(dto.businessNumber());
            }
            if (dto.logoUrl() != null && !dto.logoUrl().isBlank()) {
                c.setLogoUrl(dto.logoUrl());
            }
            if (dto.companyType() != null && !dto.companyType().isBlank()) {
                c.setCompanyType(dto.companyType());
            }
            if (dto.adres() != null && !dto.adres().isBlank()) {
                c.setAddress(dto.adres());
            }
            if (dto.ceoNm() != null && !dto.ceoNm().isBlank()) {
                c.setCeoName(dto.ceoNm());
            }
            if (dto.employeeCount() != null && !dto.employeeCount().isBlank()) {
                c.setEmployeeCount(dto.employeeCount());
            }
            if (dto.corpCode() != null && !dto.corpCode().isBlank()) {
                c.setCorpCode(dto.corpCode());
            }
            companyRepository.save(c);
        } else {
            companyRepository.save(Company.builder()
                    .companyName(dto.name())
                    .status("approved") // status를 approved로 설정
                    .regDate(new java.util.Date()) // regDate를 현재 날짜로 설정
                    // When creating new entity, only set optional fields if present
                    .description(dto.summary() != null && !dto.summary().isBlank() ? dto.summary() : null)
                    .websiteUrl(dto.homepage() != null && !dto.homepage().isBlank() ? dto.homepage() : null)
                    .businessNumber(
                            dto.businessNumber() != null && !dto.businessNumber().isBlank() ? dto.businessNumber()
                                    : null)
                    .logoUrl(dto.logoUrl() != null && !dto.logoUrl().isBlank() ? dto.logoUrl() : null)
                    .companyType(
                            dto.companyType() != null && !dto.companyType().isBlank() ? dto.companyType() : null)
                    .address(dto.adres() != null && !dto.adres().isBlank() ? dto.adres() : null)
                    .ceoName(dto.ceoNm() != null && !dto.ceoNm().isBlank() ? dto.ceoNm() : null)
                    .employeeCount(
                            dto.employeeCount() != null && !dto.employeeCount().isBlank() ? dto.employeeCount()
                                    : null)
                    .corpCode(dto.corpCode() != null && !dto.corpCode().isBlank() ? dto.corpCode() : null)
                    .build()); // 새로운 기업이면 저장
        }

    }
}