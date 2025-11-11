package com.hirepicker.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors; // Collectors 임포트 추가

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.hirepicker.dto.CalendarEmpEventDto;
import com.hirepicker.dto.CalendarJobPostingDto;
import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.dto.SearchFilterDTO;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.EmpEvent;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.EmpEventRepository;
import com.hirepicker.repository.JobPostingRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class EmploymentDataImpl implements EmploymentData {

    private final JobPostingRepository jobPostingRepository; // 채용 공고 리포지토리
    private final EmpEventRepository empEventRepository; // 채용 행사 리포지토리
    private final CompanyRepository companyRepository; // 기업 리포지토리

    @Override
    public JobPosting findByPostingIdx(Long postingIdx) {
        return jobPostingRepository.findByPostingIdx(postingIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 posting_idx에 해당하는 공고를 찾을 수 없습니다."));
    }

    // 채용 공고 목록 조회
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
                    .id(job.getPostingId()) // Populate id
                    .postingIdx(job.getPostingIdx()) // Populate postingIdx
                    .companyName(companyName)
                    .title(job.getTitle())
                    .employmentType(job.getEmploymentType())
                    .location(job.getLocation())
                    .imgUrl(job.getCompany().getImgPath())
                    .welfare(job.getWelfare())
                    .experience_level(job.getExperienceLevel())
                    .required_qualifications(job.getRequiredQualifications())
                    .preferred_qualifications(job.getPreferredQualifications())
                    .salaryInfo(job.getSalaryInfo())
                    .build();

            jobDtos.add(jobDto);
        }

        return new PageImpl<>(jobDtos, pageable, jobPostings.getTotalElements());

    }

    // 채용 행사 목록 조회
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

    // EmpEvent 엔티티를 EventDto로 변환
    private static EventDto convertToEventDto(EmpEvent event) {
        return new EventDto(
                event.getEventCode(),
                event.getEventName(),
                event.getEventDuration(),
                event.getArea());
    }

    // 기업 목록 조회
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

    // 특정 기업 상세 정보 조회
    @Override
    public CompanyDto getCompany(Long companyIdx) {
        Optional<Company> companyOptional = companyRepository.findByCompanyIdx(companyIdx);
        if (!companyOptional.isPresent()) {
            return null;
        }
        return convertToCompanyDto(companyOptional.get());
    }

    // Company 엔티티를 CompanyDto로 변환
    public static CompanyDto convertToCompanyDto(Company company) {
        return new CompanyDto(
                company.getCompanyIdx(),
                company.getCompanyId(),
                company.getCompanyName(), // name
                company.getDescription(), // summary
                company.getWebsiteUrl(), // homepage
                company.getBusinessNumber(),
                company.getLogoUrl(),
                company.getCompanyType(),
                company.getCeoName(), // ceoNm
                company.getAddress(), // adres
                company.getEmployeeCount(),
                company.getCorpCode(),
                company.getStatus(),
                company.getRegDate(),
                company.getSalesAmount(), // sales_amount
                company.getWelfareBenefits()); // welfare_benefits
    }

    public Page<JobDto> jobFilter(SearchFilterDTO dto, Pageable pageable) {
        Specification<JobPosting> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 🔍 검색어(title)
            if (dto.getSearchTerm() != null && !dto.getSearchTerm().isEmpty()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.join("company").get("companyName")),
                                "%" + dto.getSearchTerm().trim().toLowerCase() + "%"));
            }

            // 🧩 직종
            if (dto.getFilters().get("jobType") != null && !dto.getFilters().get("jobType").isEmpty()) {
                predicates.add(root.get("jobType").in(dto.getFilters().get("jobType")));
            }

            // 📍 근무 지역 (OR 조건)
            if (dto.getFilters().get("location") != null && !dto.getFilters().get("location").isEmpty()) {
                List<String> locations = dto.getFilters().get("location");
                List<Predicate> locationPredicates = new ArrayList<>();
                for (String loc : locations) {
                    locationPredicates.add(
                            cb.like(
                                    cb.lower(root.join("company").get("address")),
                                    "%" + loc.trim().toLowerCase() + "%"));
                }
                predicates.add(cb.or(locationPredicates.toArray(new Predicate[0])));
            }

            // 💼 고용 형태 (LIKE 검색)
            if (dto.getFilters().get("employmentType") != null && !dto.getFilters().get("employmentType").isEmpty()) {
                List<String> employmentTypes = dto.getFilters().get("employmentType");
                List<Predicate> employmentPredicates = new ArrayList<>();
                for (String type : employmentTypes) {
                    employmentPredicates.add(
                            cb.like(cb.lower(root.get("employmentType")), "%" + type.trim().toLowerCase() + "%"));
                }
                predicates.add(cb.or(employmentPredicates.toArray(new Predicate[0])));
            }

            // 🎓 학력 (LIKE 검색, REPLACE 제거)
            if (dto.getFilters().get("experienceLevel") != null && !dto.getFilters().get("experienceLevel").isEmpty()) {
                List<String> experienceLevels = dto.getFilters().get("experienceLevel");
                List<Predicate> expPredicates = new ArrayList<>();
                for (String level : experienceLevels) {
                    if (level == null || level.isBlank())
                        continue;

                    String pattern = "%" + level.trim().toLowerCase() + "%";
                    System.out.println("DEBUG: pattern='" + pattern + "'");
                    expPredicates.add(
                            cb.like(cb.lower(root.get("experienceLevel")), pattern));
                }
                predicates.add(cb.or(expPredicates.toArray(new Predicate[0])));
            }

            // ✅ 기업 종류 (JobPosting.location 컬럼 기준)
            if (dto.getFilters().get("companyType") != null && !dto.getFilters().get("companyType").isEmpty()) {
                predicates.add(root.get("location").in(dto.getFilters().get("companyType")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<JobPosting> jobPostings = jobPostingRepository.findAll(spec, pageable);

        List<JobDto> jobDtos = new ArrayList<>();
        for (JobPosting job : jobPostings.getContent()) {
            String companyName = "";
            String imgUrl = null;
            if (job.getCompany() != null) {
                companyName = job.getCompany().getCompanyName();
                imgUrl = job.getCompany().getImgPath();
            }

            jobDtos.add(JobDto.builder()
                    .id(job.getPostingId()) // Populate id
                    .postingIdx(job.getPostingIdx()) // Populate postingIdx
                    .companyName(companyName)
                    .title(job.getTitle())
                    .employmentType(job.getEmploymentType())
                    .location(job.getLocation())
                    .imgUrl(imgUrl)
                    .experience_level(job.getExperienceLevel())
                    .companyType(job.getCompany() != null ? job.getCompany().getCompanyType() : null)
                    .jobType(job.getJobType())
                    .welfare(job.getWelfare())
                    .experience_level(job.getExperienceLevel())
                    .required_qualifications(job.getRequiredQualifications())
                    .preferred_qualifications(job.getPreferredQualifications())
                    .salaryInfo(job.getSalaryInfo())
                    .build());
        }

        return new PageImpl<>(jobDtos, pageable, jobPostings.getTotalElements());
    }

    @Override
    public List<CalendarJobPostingDto> getAllJobPostingsForCalendar() {
        List<JobPosting> jobPostings = jobPostingRepository.findAll();
        List<CalendarJobPostingDto> dtoList = new ArrayList<>();

        for (JobPosting jobPosting : jobPostings) {
            CalendarJobPostingDto dto = CalendarJobPostingDto.fromEntity(jobPosting);
            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public List<CalendarEmpEventDto> getAllEmpEventsForCalendar() {
        List<EmpEvent> empEvents = empEventRepository.findAll();
        List<CalendarEmpEventDto> dtoList = new ArrayList<>();

        for (EmpEvent empEvent : empEvents) {
            CalendarEmpEventDto dto = CalendarEmpEventDto.fromEntity(empEvent);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public List<CalendarEmpEventDto> getAllEmpEventsForCalendarByRegions(List<String> regions) {
        List<EmpEvent> empEvents;
        if (regions == null || regions.isEmpty()) {
            empEvents = empEventRepository.findAll();
        } else {
            empEvents = empEventRepository.findByAreaContainingAnyOf(regions);
        }
        List<CalendarEmpEventDto> dtoList = new ArrayList<>();
        for (EmpEvent empEvent : empEvents) {
            CalendarEmpEventDto dto = CalendarEmpEventDto.fromEntity(empEvent);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public List<JobDto> getJobPostingsByCompanyIdx(Long companyIdx) {
        List<JobPosting> jobPostings = jobPostingRepository.findByCompany_CompanyIdx(companyIdx);
        List<JobDto> jobDtos = new ArrayList<>();

        for (JobPosting job : jobPostings) {
            String companyName = "";
            String imgUrl = null;
            if (job.getCompany() != null) {
                companyName = job.getCompany().getCompanyName();
                imgUrl = job.getCompany().getImgPath();
            }

            jobDtos.add(JobDto.builder()
                    .id(job.getPostingId()) // Populate id
                    .postingIdx(job.getPostingIdx()) // Populate postingIdx
                    .companyName(companyName)
                    .title(job.getTitle())
                    .employmentType(job.getEmploymentType())
                    .location(job.getLocation())
                    .imgUrl(imgUrl)
                    .experience_level(job.getExperienceLevel())
                    .companyType(job.getCompany() != null ? job.getCompany().getCompanyType() : null)
                    .jobType(job.getJobType())
                    .companyIdx(job.getCompany() != null ? job.getCompany().getCompanyIdx() : null)
                    .welfare(job.getWelfare())
                    .experience_level(job.getExperienceLevel())
                    .required_qualifications(job.getRequiredQualifications())
                    .preferred_qualifications(job.getPreferredQualifications())
                    .salaryInfo(job.getSalaryInfo())
                    .build());
        }
        return jobDtos;
    }

    @Override
    public JobDto getJobPostingById(String postingId) {
        JobPosting jobPosting = jobPostingRepository.findByPostingId(postingId)
                .orElseThrow(() -> new IllegalArgumentException("해당 posting_id에 해당하는 공고를 찾을 수 없습니다."));

        String companyName = "";
        String imgUrl = null;
        if (jobPosting.getCompany() != null) {
            companyName = jobPosting.getCompany().getCompanyName();
            imgUrl = jobPosting.getCompany().getImgPath();
        }

        return JobDto.builder()
                .id(jobPosting.getPostingId())
                .postingIdx(jobPosting.getPostingIdx()) // Populate postingIdx
                .companyName(companyName)
                .title(jobPosting.getTitle())
                .employmentType(jobPosting.getEmploymentType())
                .location(jobPosting.getLocation())
                .imgUrl(imgUrl)
                .experience_level(jobPosting.getExperienceLevel())
                .companyType(jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyType() : null)
                .jobType(jobPosting.getJobType())
                .description(jobPosting.getDescription())
                .endDate(jobPosting.getEndDate() != null ? jobPosting.getEndDate().toString() : null)
                .startDate(jobPosting.getStartDate() != null ? jobPosting.getStartDate().toString() : null)
                .companyIdx(jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyIdx() : null)
                .welfare(jobPosting.getWelfare())
                .experience_level(jobPosting.getExperienceLevel())
                .required_qualifications(jobPosting.getRequiredQualifications())
                .preferred_qualifications(jobPosting.getPreferredQualifications())
                .salaryInfo(jobPosting.getSalaryInfo())
                .build();
    }

    @Override
    public JobDto getJobPostingByPostingIdx(Long postingIdx) {
        JobPosting jobPosting = jobPostingRepository.findByPostingIdx(postingIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 posting_idx에 해당하는 공고를 찾을 수 없습니다."));

        String companyName = "";
        String imgUrl = null;
        if (jobPosting.getCompany() != null) {
            companyName = jobPosting.getCompany().getCompanyName();
            imgUrl = jobPosting.getCompany().getImgPath();
        }

        return JobDto.builder()
                .id(jobPosting.getPostingId()) // Populate id
                .postingIdx(jobPosting.getPostingIdx()) // Populate postingIdx
                .companyName(companyName)
                .title(jobPosting.getTitle())
                .employmentType(jobPosting.getEmploymentType())
                .location(jobPosting.getLocation())
                .imgUrl(imgUrl)
                .experience_level(jobPosting.getExperienceLevel())
                .companyType(jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyType() : null)
                .jobType(jobPosting.getJobType())
                .description(jobPosting.getDescription())
                .endDate(jobPosting.getEndDate() != null ? jobPosting.getEndDate().toString() : null)
                .startDate(jobPosting.getStartDate() != null ? jobPosting.getStartDate().toString() : null)
                .companyIdx(jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyIdx() : null)
                .welfare(jobPosting.getWelfare())
                .experience_level(jobPosting.getExperienceLevel())
                .required_qualifications(jobPosting.getRequiredQualifications())
                .preferred_qualifications(jobPosting.getPreferredQualifications())
                .salaryInfo(jobPosting.getSalaryInfo())
                .build();
    }

    @Override
    public List<JobDto> getJobPostingsByCompanyIds(List<Long> companyIds) {
        if (companyIds == null || companyIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<JobPosting> jobPostings = jobPostingRepository.findByCompany_CompanyIdxIn(companyIds);
        return jobPostings.stream()
                .map(jobPosting -> {
                    String companyName = "";
                    String imgUrl = null;
                    if (jobPosting.getCompany() != null) {
                        companyName = jobPosting.getCompany().getCompanyName();
                        imgUrl = jobPosting.getCompany().getImgPath();
                    }
                    return JobDto.builder()
                            .id(jobPosting.getPostingId())
                            .postingIdx(jobPosting.getPostingIdx())
                            .companyName(companyName)
                            .title(jobPosting.getTitle())
                            .employmentType(jobPosting.getEmploymentType())
                            .location(jobPosting.getLocation())
                            .imgUrl(imgUrl)
                            .experience_level(jobPosting.getExperienceLevel())
                            .companyType(jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyType() : null)
                            .jobType(jobPosting.getJobType())
                            .companyIdx(jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyIdx() : null)
                            .welfare(jobPosting.getWelfare())
                            .experience_level(jobPosting.getExperienceLevel())
                            .required_qualifications(jobPosting.getRequiredQualifications())
                            .preferred_qualifications(jobPosting.getPreferredQualifications())
                            .salaryInfo(jobPosting.getSalaryInfo())
                            .build();
                })
                .collect(Collectors.toList());
    }
}

