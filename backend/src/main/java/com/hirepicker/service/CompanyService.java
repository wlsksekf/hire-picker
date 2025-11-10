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
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
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
        // 중복 검사
        if (companyRepository.existsByCompanyName(dto.name())) {
            throw new IllegalStateException("이미 등록된 회사명입니다.");
        }
        if (companyRepository.existsByBusinessNumber(dto.businessNumber())) {
            throw new IllegalStateException("이미 등록된 사업자등록번호입니다.");
        }

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
                .status("PENDING") // 상태를 'PENDING'으로 고정
                .regDate(new Date()) // 등록일을 현재 날짜로 설정
                .build();

        Company savedCompany = companyRepository.saveAndFlush(company);
        return EmploymentDataImpl.convertToCompanyDto(savedCompany);
    }

    public boolean isCompanyNameDuplicate(String companyName) {
        return companyRepository.existsByCompanyName(companyName);
    }

    public boolean isBusinessNumberDuplicate(String businessNumber) {
        return companyRepository.existsByBusinessNumber(businessNumber);
    }
}
