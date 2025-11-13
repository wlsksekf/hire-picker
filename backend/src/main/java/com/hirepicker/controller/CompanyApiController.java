package com.hirepicker.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.dto.CalendarEmpEventDto;
import com.hirepicker.dto.CalendarJobPostingDto;
import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.CompanySearchResponseDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.service.CompanyDataUpdateService;
import com.hirepicker.service.CompanyService;
import com.hirepicker.service.EmploymentData;
import com.hirepicker.service.EmploymentDataService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "기업 API", description = "기업 정보 관련 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class CompanyApiController {

    private final EmploymentDataService employmentDataService;
    private final EmploymentData employmentData;
    private final CompanyDataUpdateService companyDataUpdateService;
    private final CompanyService companyService;

    @Operation(summary = "채용공고 목록 조회", description = "페이지네이션을 적용하여 채용공고 목록을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/work24/jobs")
    public ResponseEntity<PagedModel<EntityModel<JobDto>>> getJobs(
            Pageable pageable,
            PagedResourcesAssembler<JobDto> assembler) {
        Page<JobDto> jobs = employmentData.getJobs(pageable, null);
        return ResponseEntity.ok(assembler.toModel(jobs));
    }

    @Operation(summary = "채용박람회 목록 조회", description = "페이지네이션을 적용하여 채용박람회 목록을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/work24/events")
    public ResponseEntity<PagedModel<EntityModel<EventDto>>> getEvents(
            Pageable pageable,
            PagedResourcesAssembler<EventDto> assembler) {
        Page<EventDto> events = employmentData.getEvents(pageable, null);
        return ResponseEntity.ok(assembler.toModel(events));
    }

    @Operation(summary = "기업 목록 조회", description = "페이지네이션과 검색 기능을 적용하여 기업 목록을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/companies")
    public ResponseEntity<PagedModel<EntityModel<CompanyDto>>> getCompanies(
            @Parameter(description = "검색어") @RequestParam(value = "query", required = false, defaultValue = "") String query,
            Pageable pageable,
            PagedResourcesAssembler<CompanyDto> assembler) {
        Page<CompanyDto> companies = employmentData.getCompanies(query, pageable);
        return ResponseEntity.ok(assembler.toModel(companies));
    }

    @Operation(summary = "기업 상세 정보 조회", description = "company_idx를 이용하여 특정 기업의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "기업을 찾을 수 없음")
    })
    @GetMapping("/companies/{idx}")
    public ResponseEntity<CompanyDto> getCompany(
            @Parameter(description = "기업 인덱스", required = true) @PathVariable("idx") Long idx) {
        CompanyDto companyDto = employmentData.getCompany(idx);
        if (companyDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(companyDto);
    }

    @Operation(summary = "기업 검색", description = "이름으로 기업을 검색합니다.")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "기업 검색 성공") })
    @GetMapping("/companies/search")
    public ResponseEntity<List<CompanySearchResponseDto>> searchCompanies(
            @Parameter(description = "검색할 기업 이름", required = true) @RequestParam("name") String name) {
        return ResponseEntity.ok(companyService.searchByName(name));
    }

    @Operation(summary = "신규 회사 등록", description = "새로운 회사 정보를 시스템에 등록합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "등록 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping("/CreateCompanies")
    public ResponseEntity<CompanyDto> createCompany(
            @Parameter(description = "등록할 회사 정보", required = true) @RequestBody CompanyDto CompanyDto) {
        try {
            CompanyDto CreateCompany = companyService.createCompany(CompanyDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(CreateCompany);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // --- 수동 동기화 트리거 API --- //

    @Operation(summary = "채용공고 데이터 동기화", description = "Work24 API를 통해 채용공고 데이터를 수동으로 동기화합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "채용공고 동기화 시작")
    })
    @GetMapping("/work24/sync/jobs")
    public ResponseEntity<String> syncJobs() {
        try {
            employmentDataService.synchronizePublicJobs();
            return ResponseEntity.ok("채용공고 동기화가 시작되었습니다!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("채용공고 동기화 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Operation(summary = "채용박람회 데이터 동기화", description = "Work24 API를 통해 채용박람회 데이터를 수동으로 동기화합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "동기화 시작")
    })
    @GetMapping("/work24/sync/events")
    public ResponseEntity<String> syncEvents() {
        employmentDataService.synchronizeEvents();
        return ResponseEntity.ok("채용박람회 동기화가 시작되었습니다!");
    }

    @Operation(summary = "work24 기업 데이터 동기화", description = "Work24 API를 통해 기업 데이터를 수동으로 동기화합니다.")
    @GetMapping("/work24/sync/companies")
    public ResponseEntity<String> syncWork24Companies() {
        employmentDataService.synchronizeCompanies();
        return ResponseEntity.ok("work24 기업 데이터 동기화가 시작되었습니다!");
    }

    @Operation(summary = "dart 기업 데이터 동기화", description = "dart API를 통해 기업 데이터를 수동으로 동기화합니다.")
    @GetMapping("/dart/sync/companies")
    public ResponseEntity<String> syncDartCompanies() {
        try {
            employmentDataService.SyncDartInfo();
        } catch (Exception e) {
            System.out.println("Dart synchronization failed: " + e.getMessage());
        }
        return ResponseEntity.ok("dart 기업 데이터 동기화가 시작되었습니다!");
    }

    @Operation(summary = "국민연금 데이터 동기화", description = "국민연급 csv 파일을 불러와 데이터를 수동으로 동기화합니다.")
    @GetMapping("/national-pension/sync/update-from-csv")
    public ResponseEntity<String> updateFromCsv() {
        try {
            int updated = companyDataUpdateService.updateCompanyDataFromCsv();
            String msg = String.format("Successfully updated %d companies", updated);
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to update company data: " + e.getMessage());
        }
    }

    @Operation(summary = "캘린더용 채용 공고 목록 조회", description = "캘린더에 표시할 모든 채용 공고 목록을 조회합니다.")
    @GetMapping("/calendar/job-postings")
    public ResponseEntity<List<CalendarJobPostingDto>> getAllJobPostingsForCalendar() {
        List<CalendarJobPostingDto> jobPostings = employmentData.getAllJobPostingsForCalendar();
        return ResponseEntity.ok(jobPostings);
    }

    @Operation(summary = "캘린더용 채용 행사 목록 조회", description = "캘린더에 표시할 모든 채용 행사 목록을 조회합니다.")
    @GetMapping("/calendar/emp-events")
    public ResponseEntity<List<CalendarEmpEventDto>> getAllEmpEventsForCalendar(
            @Parameter(description = "필터링할 지역 목록 (선택 사항)", example = "서울,부산") @RequestParam(value = "regions", required = false) List<String> regions) {
        List<CalendarEmpEventDto> empEvents = employmentData.getAllEmpEventsForCalendarByRegions(regions);
        return ResponseEntity.ok(empEvents);
    }

    @Operation(summary = "특정 기업의 채용 공고 목록 조회", description = "company_idx를 이용하여 특정 기업의 채용 공고 목록을 조회합니다.")
    @GetMapping("/companies/{companyIdx}/job-postings")
    public ResponseEntity<List<JobDto>> getJobPostingsByCompanyIdx(@PathVariable("companyIdx") Long companyIdx) {
        List<JobDto> jobPostings = employmentData.getJobPostingsByCompanyIdx(companyIdx);
        if (jobPostings.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(jobPostings);
    }

}
