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
import lombok.extern.slf4j.Slf4j; // Slf4j 임포트 추가
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.orm.jpa.JpaObjectRetrievalFailureException; // JpaObjectRetrievalFailureException 임포트 추가

@Slf4j // Slf4j 어노테이션 추가
@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class EmploymentDataProcessorService {

    private final CompanyRepository companyRepository; // 기업 리포지토리
    private final JobPostingRepository jobPostingRepository; // 채용 공고 리포지토리
    private final EmpEventRepository empEventRepository; // 채용 행사 리포지토리

    // JobDto를 처리하여 DB에 저장/업데이트
    @Transactional
    public void processJobDto(JobDto dto) {
        Company company = companyRepository.findTopByCompanyName(dto.companyName())
                .orElseGet(() -> companyRepository.save(Company.builder().companyName(dto.companyName()).build()));

        jobPostingRepository.findByPostingId(dto.id()).ifPresentOrElse(
            p -> { // 이미 존재하는 공고이면 업데이트
                // 기존 JobPosting의 Company 참조가 유효한지 확인
                try {
                    // Company 객체에 접근하여 JpaObjectRetrievalFailureException 발생 여부 확인
                    // 실제 DB 접근이 일어나는 시점은 getCompany() 호출 시점일 수 있음
                    // 또는 p.getCompany().getCompanyIdx() 등으로 접근하여 강제 로딩
                    p.getCompany().getCompanyIdx(); // 강제로 Company 로딩 시도
                } catch (JpaObjectRetrievalFailureException e) {
                    log.warn("기존 JobPosting {} (ID: {})의 Company 참조가 유효하지 않습니다. 새로운 Company ({})로 재설정합니다.",
                            p.getPostingId(), p.getPostingIdx(), company.getCompanyName());
                    p.setCompany(company); // 유효하지 않은 경우 새로운 Company로 재설정
                } catch (Exception e) {
                    log.error("JobPosting {}의 Company 참조 확인 중 예외 발생: {}", p.getPostingId(), e.getMessage());
                    p.setCompany(company); // 다른 예외 발생 시에도 새로운 Company로 재설정
                }

                p.setTitle(dto.title());
                p.setEmploymentType(dto.employmentType());
                p.setLocation(dto.location());
                jobPostingRepository.save(p);
            },
            () -> jobPostingRepository.save(JobPosting.builder().postingId(dto.id()).company(company).title(dto.title()).employmentType(dto.employmentType()).location(dto.location()).build()) // 새로운 공고이면 저장
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
            () -> empEventRepository.save(EmpEvent.builder().eventCode(dto.id()).eventName(dto.title()).eventDuration(dto.period()).area(dto.location()).build()) // 새로운 행사이면 저장
        );
    }

    // CompanyDto를 처리하여 DB에 저장/업데이트
    @Transactional
    public void processCompanyDto(CompanyDto dto) {
        companyRepository.findByCompanyId(dto.id()).ifPresentOrElse(
            c -> { // 이미 존재하는 기업이면 업데이트
                c.setCompanyName(dto.name());
                c.setDescription(dto.summary());
                c.setWebsiteUrl(dto.homepage());
                c.setBusinessNumber(dto.businessNumber());
                c.setLogoUrl(dto.logoUrl());
                c.setCompanyType(dto.companyType());
                c.setAddress(dto.adres()); // New field
                c.setCeoName(dto.ceoNm()); // New field
                c.setEmployeeCount(dto.employeeCount()); // New field
                c.setCorpCode(dto.corpCode()); // New field
                companyRepository.save(c);
            },
            () -> companyRepository.save(Company.builder()
                    .companyId(dto.id())
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