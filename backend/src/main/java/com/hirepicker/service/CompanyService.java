package com.hirepicker.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.CompanyInfoDto;
import com.hirepicker.dto.CompanySearchResponseDto;
import com.hirepicker.dto.CompanyUpdateDto;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.CompanyUserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyUserRepository companyUserRepository;

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

    /**
     * 기업회원의 회사 정보 조회
     *
     * @param companyUserId 기업회원 ID (CompanyUser의 PK)
     * @return 회사 정보 DTO
     * @throws IllegalStateException 사용자 또는 회사 정보를 찾을 수 없는 경우
     */
    public CompanyInfoDto getCompanyByUserId(Long companyUserId) {
        log.info("[Service] 회사 정보 조회 시작. CompanyUser ID: {}", companyUserId);

        // CompanyUser 조회
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> {
                    log.error("[Service] CompanyUser를 찾을 수 없습니다. ID: {}", companyUserId);
                    return new IllegalStateException("사용자 정보를 찾을 수 없습니다.");
                });

        // 연결된 Company 확인
        Company company = companyUser.getCompany();
        if (company == null) {
            log.error("[Service] CompanyUser에 연결된 Company가 없습니다. CompanyUser ID: {}", companyUserId);
            throw new IllegalStateException("회사 정보를 찾을 수 없습니다.");
        }

        log.info("[Service] 회사 정보 조회 성공. Company ID: {}, 회사명: {}",
                company.getCompanyIdx(), company.getCompanyName());

        // Entity → DTO 변환 (순환 참조 방지)
        return CompanyInfoDto.fromEntity(company);
    }

    /**
     * 기업회원의 회사 정보 업데이트
     *
     * @param companyUserId 기업회원 ID (CompanyUser의 PK)
     * @param updateDto 업데이트할 회사 정보
     * @return 업데이트된 회사 정보 DTO
     * @throws IllegalStateException 사용자 또는 회사 정보를 찾을 수 없는 경우
     */
    @Transactional
    public CompanyInfoDto updateCompanyInfo(Long companyUserId, CompanyUpdateDto updateDto) {
        log.info("[Service] 회사 정보 업데이트 시작. CompanyUser ID: {}", companyUserId);

        // CompanyUser 조회
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> {
                    log.error("[Service] CompanyUser를 찾을 수 없습니다. ID: {}", companyUserId);
                    return new IllegalStateException("사용자 정보를 찾을 수 없습니다.");
                });

        // 연결된 Company 확인
        Company company = companyUser.getCompany();
        if (company == null) {
            log.error("[Service] CompanyUser에 연결된 Company가 없습니다. CompanyUser ID: {}", companyUserId);
            throw new IllegalStateException("회사 정보를 찾을 수 없습니다.");
        }

        // 필드별 업데이트 (null이 아닌 값만 업데이트)
        if (updateDto.getCompanyName() != null && !updateDto.getCompanyName().trim().isEmpty()) {
            company.setCompanyName(updateDto.getCompanyName());
            log.info("[Service] 회사명 업데이트: {}", updateDto.getCompanyName());
        }

        if (updateDto.getCeoName() != null && !updateDto.getCeoName().trim().isEmpty()) {
            company.setCeoName(updateDto.getCeoName());
            log.info("[Service] 대표자명 업데이트: {}", updateDto.getCeoName());
        }

        if (updateDto.getAddress() != null && !updateDto.getAddress().trim().isEmpty()) {
            company.setAddress(updateDto.getAddress());
            log.info("[Service] 주소 업데이트: {}", updateDto.getAddress());
        }

        if (updateDto.getDescription() != null && !updateDto.getDescription().trim().isEmpty()) {
            company.setDescription(updateDto.getDescription());
            log.info("[Service] 회사 소개 업데이트");
        }

        if (updateDto.getBusinessNumber() != null && !updateDto.getBusinessNumber().trim().isEmpty()) {
            company.setBusinessNumber(updateDto.getBusinessNumber());
            log.info("[Service] 사업자등록번호 업데이트: {}", updateDto.getBusinessNumber());
        }

        if (updateDto.getWebsiteUrl() != null && !updateDto.getWebsiteUrl().trim().isEmpty()) {
            company.setWebsiteUrl(updateDto.getWebsiteUrl());
            log.info("[Service] 웹사이트 URL 업데이트: {}", updateDto.getWebsiteUrl());
        }

        if (updateDto.getEmployeeCount() != null && !updateDto.getEmployeeCount().trim().isEmpty()) {
            company.setEmployeeCount(updateDto.getEmployeeCount());
            log.info("[Service] 직원 수 업데이트: {}", updateDto.getEmployeeCount());
        }

        // 변경사항 저장 (@Transactional로 자동 커밋)
        Company updatedCompany = companyRepository.save(company);

        log.info("[Service] 회사 정보 업데이트 완료. Company ID: {}", updatedCompany.getCompanyIdx());

        // 업데이트된 정보를 DTO로 변환하여 반환
        return CompanyInfoDto.fromEntity(updatedCompany);
    }
}
