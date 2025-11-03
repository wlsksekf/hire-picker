package com.hirepicker.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.CompanySearchResponseDto;
import com.hirepicker.entity.Company;
import com.hirepicker.repository.CompanyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    public List<CompanySearchResponseDto> searchByName(String name) {
        // 자동완성을 위해 상위 10개 결과만 가져옴
        Pageable pageable = PageRequest.of(0, 10);
        return companyRepository.findByCompanyNameContainingIgnoreCase(name, pageable)
                .getContent()
                .stream()
                .map(CompanySearchResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CompanyDto createCompany(CompanyDto dto) {
        Company company = Company.builder()
                .companyName(dto.name())
                .businessNumber(dto.businessNumber())
                .ceoName(dto.ceoNm())
                .address(dto.adres())
                .websiteUrl(dto.homepage())
                .description(dto.summary())
                .logoUrl(dto.logoUrl())
                .employeeCount(dto.employeeCount())
                .companyType(dto.companyType())
                .corpCode(dto.corpCode())
                .salesAmount(dto.sales_amount())
                .welfareBenefits(dto.welfare_benefits())
                .status(dto.status() != null ? dto.status() : "active") // DTO에 상태가 있으면 사용, 없으면 active
                .regDate(dto.regDate() != null ? dto.regDate() : new Date()) // DTO에 등록일이 있으면 사용, 없으면 현재 날짜
                .build();

        Company savedCompany = companyRepository.save(company);
        return EmploymentDataImpl.convertToCompanyDto(savedCompany);
    }
}
