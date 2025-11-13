package com.hirepicker.service;

import java.time.LocalDate; // LocalDate 임포트 추가
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
import com.hirepicker.entity.JobPostingStatus;
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
    public Page<JobDto> getJobs(Pageable pageable, String search) { // search 파라미터 추가

        Specification<JobPosting> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String lowerCaseSearch = search.trim().toLowerCase();
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), "%" + lowerCaseSearch + "%");
                Predicate companyNamePredicate = cb.like(cb.lower(root.join("company").get("companyName")),
                        "%" + lowerCaseSearch + "%");
                predicates.add(cb.or(titlePredicate, companyNamePredicate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<JobPosting> jobPostings = jobPostingRepository.findAll(spec, pageable);

        List<JobDto> jobDtos = new ArrayList<>();
        for (JobPosting job : jobPostings.getContent()) {
            Company company = job.getCompany();
            String companyName = company != null ? company.getCompanyName() : "";
            String imgPath = company != null ? company.getImgPath() : null;
            String applyUrl = company != null ? company.getWebsiteUrl() : null;
            boolean internal = job.getCUserIdx() != null;

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
                    .internal(internal) // 내부 지원 가능 여부
                    .applyUrl(applyUrl) // 외부 지원 링크
                    .status(job.getStatus() != null ? job.getStatus().toString() : JobPostingStatus.OPEN.toString()) // status 필드 추가, null일 경우 OPEN으로 설정
                    .startDate(job.getStartDate() != null ? job.getStartDate().toString() : null) // startDate 추가
                    .endDate(job.getEndDate() != null ? job.getEndDate().toString() : null) // endDate 추가
                    .build();

            jobDtos.add(jobDto);
        }

        return new PageImpl<>(jobDtos, pageable, jobPostings.getTotalElements());

    }

    // 채용 행사 목록 조회
    @Override
    public Page<EventDto> getEvents(Pageable pageable, String search) { // search 파라미터 추가
        Specification<EmpEvent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String lowerCaseSearch = search.trim().toLowerCase();
                Predicate eventNamePredicate = cb.like(cb.lower(root.get("eventName")), "%" + lowerCaseSearch + "%");
                Predicate eventCodePredicate = cb.like(cb.lower(root.get("eventCode")), "%" + lowerCaseSearch + "%");
                predicates.add(cb.or(eventNamePredicate, eventCodePredicate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EmpEvent> empEvents = empEventRepository.findAll(spec, pageable);

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
                event.getArea(),
                event.getEventStatus()); // eventStatus 필드 추가
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

    public Page<JobDto> jobFilter(SearchFilterDTO dto, Pageable pageable, String dateStatus) {
        Specification<JobPosting> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            LocalDate currentDate = LocalDate.now();

            Map<String, List<String>> filters = dto.getFilters() == null
                    ? java.util.Collections.emptyMap()
                    : dto.getFilters();

            // 🔍 검색어(title)
            if (dto.getSearchTerm() != null && !dto.getSearchTerm().isEmpty()) {
                predicates.add(
                        cb.like(
                                cb.lower(root.join("company").get("companyName")),
                                "%" + dto.getSearchTerm().trim().toLowerCase() + "%"));
            }

            // 🧩 직종
            if (filters.get("jobType") != null && !filters.get("jobType").isEmpty()) {
                predicates.add(root.get("jobType").in(filters.get("jobType")));
            }

            // 📍 근무 지역 (OR 조건)
            if (filters.get("location") != null && !filters.get("location").isEmpty()) {
                List<String> locations = filters.get("location");
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
            if (filters.get("employmentType") != null && !filters.get("employmentType").isEmpty()) {
                List<String> employmentTypes = filters.get("employmentType");
                List<Predicate> employmentPredicates = new ArrayList<>();
                for (String type : employmentTypes) {
                    employmentPredicates.add(
                            cb.like(cb.lower(root.get("employmentType")), "%" + type.trim().toLowerCase() + "%"));
                }
                predicates.add(cb.or(employmentPredicates.toArray(new Predicate[0])));
            }

            // 🎓 학력 (LIKE 검색, REPLACE 제거)
            if (filters.get("experienceLevel") != null && !filters.get("experienceLevel").isEmpty()) {
                List<String> experienceLevels = filters.get("experienceLevel");
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
            if (filters.get("companyType") != null && !filters.get("companyType").isEmpty()) {
                predicates.add(root.get("location").in(filters.get("companyType")));
            }

            // 🔁 공고 필터: 내부 지원 가능 공고 여부
            List<String> sources = filters.get("source");
            if (sources != null && !sources.isEmpty()) {
                boolean includeInternal = sources.contains("내부 지원 가능 공고");
                boolean includeExternal = sources.contains("외부 공고");

                if (includeInternal && !includeExternal) {
                    predicates.add(cb.isNotNull(root.get("cUserIdx")));
                } else if (!includeInternal && includeExternal) {
                    predicates.add(cb.isNull(root.get("cUserIdx")));
                }
            }

            // 🌍 해외 공고 필터 (country가 South Korea가 아닌 경우)
            List<String> overseasFilters = filters.get("overseas");
            if (overseasFilters != null && !overseasFilters.isEmpty()) {
                boolean includeDomestic = overseasFilters.contains("국내 공고");
                boolean includeOverseas = overseasFilters.contains("해외 공고");

                if (includeDomestic && !includeOverseas) {
                    predicates.add(cb.or(
                            cb.isNull(root.get("country")),
                            cb.equal(cb.lower(root.get("country")), "south korea")));
                } else if (!includeDomestic && includeOverseas) {
                    predicates.add(cb.and(
                            cb.isNotNull(root.get("country")),
                            cb.notEqual(cb.lower(root.get("country")), "south korea")));
                }
            }

            // 📅 날짜 상태 필터링 (dateStatus)
            if (dateStatus != null && !dateStatus.isEmpty()) {
                if ("available".equalsIgnoreCase(dateStatus)) {
                    // 가능 공고: end_date가 null이거나 현재 날짜보다 크거나 같은 경우
                    predicates.add(cb.or(
                            cb.isNull(root.get("endDate")),
                            cb.greaterThanOrEqualTo(root.get("endDate"), currentDate)));
                } else if ("past".equalsIgnoreCase(dateStatus)) {
                    // 지난 공고: end_date가 현재 날짜보다 작은 경우 (null은 제외)
                    predicates.add(cb.and(
                            cb.isNotNull(root.get("endDate")),
                            cb.lessThan(root.get("endDate"), currentDate)));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<JobPosting> jobPostings = jobPostingRepository.findAll(spec, pageable);

        List<JobDto> jobDtos = new ArrayList<>();
        for (JobPosting job : jobPostings.getContent()) {
            Company company = job.getCompany();
            String companyName = company != null ? company.getCompanyName() : "";
            String imgUrl = company != null ? company.getImgPath() : null;
            String companyAddress = company != null ? company.getAddress() : null;
            String applyUrl = company != null ? company.getWebsiteUrl() : null;
            boolean internal = job.getCUserIdx() != null;

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
                    .internal(internal) // 내부 지원 가능 여부
                    .applyUrl(applyUrl) // 외부 지원 링크
                    .status(job.getStatus() != null ? job.getStatus().toString() : JobPostingStatus.OPEN.toString()) // status 필드 추가, null일 경우 OPEN으로 설정
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
                .status(jobPosting.getStatus() != null ? jobPosting.getStatus().toString() : JobPostingStatus.OPEN.toString()) // status 필드 추가, null일 경우 OPEN으로 설정
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
                .status(jobPosting.getStatus() != null ? jobPosting.getStatus().toString() : JobPostingStatus.OPEN.toString()) // status 필드 추가, null일 경우 OPEN으로 설정
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
                            .companyType(
                                    jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyType() : null)
                            .jobType(jobPosting.getJobType())
                            .companyIdx(
                                    jobPosting.getCompany() != null ? jobPosting.getCompany().getCompanyIdx() : null)
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
