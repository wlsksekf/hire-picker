package com.hirepicker.controller;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.service.EmploymentDataService;
import com.hirepicker.service.EmploymentData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@Tag(name = "Work24", description = "Work24 관련 API") // Swagger 태그 설정
@RestController // REST 컨트롤러임을 선언
@RequestMapping("/api/work24") // "/api/work24" 경로에 매핑
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class Work24Controller {

    private final EmploymentDataService employmentDataService;
    private final EmploymentData employmentData;

    // --- 데이터 조회 API (페이지네이션 적용) --- //

    @Operation(summary = "채용공고 목록 조회", description = "페이지네이션을 적용하여 채용공고 목록을 조회합니다.")
    @GetMapping("/jobs")
    public ResponseEntity<PagedModel<EntityModel<JobDto>>> getJobs(Pageable pageable, PagedResourcesAssembler<JobDto> assembler) {
        Page<JobDto> jobs = employmentData.getJobs(pageable);
        return ResponseEntity.ok(assembler.toModel(jobs));
    }

    @Operation(summary = "채용박람회 목록 조회", description = "페이지네이션을 적용하여 채용박람회 목록을 조회합니다.")
    @GetMapping("/events")
    public ResponseEntity<PagedModel<EntityModel<EventDto>>> getEvents(Pageable pageable, PagedResourcesAssembler<EventDto> assembler) {
        Page<EventDto> events = employmentData.getEvents(pageable);
        return ResponseEntity.ok(assembler.toModel(events));
    }

    @Operation(summary = "기업 목록 조회", description = "페이지네이션과 검색 기능을 적용하여 기업 목록을 조회합니다.")
    @GetMapping("/companies")
    public ResponseEntity<PagedModel<EntityModel<CompanyDto>>> getCompanies(
            @RequestParam(value = "query", required = false, defaultValue = "") String query,
            Pageable pageable, PagedResourcesAssembler<CompanyDto> assembler) {
        Page<CompanyDto> companies = employmentData.getCompanies(query, pageable);
        return ResponseEntity.ok(assembler.toModel(companies));
    }

    @Operation(summary = "기업 상세 정보 조회", description = "ID를 이용하여 특정 기업의 상세 정보를 조회합니다.")
    @GetMapping("/companies/{id}")
    public ResponseEntity<CompanyDto> getCompany(@PathVariable("id") String id) {
        CompanyDto companyDto = employmentData.getCompany(id);
        return ResponseEntity.ok(companyDto);
    }

    // --- 수동 동기화 트리거 API --- //

    @Operation(summary = "채용공고 데이터 동기화", description = "Work24 API를 통해 채용공고 데이터를 수동으로 동기화합니다.")
    @GetMapping("/sync/jobs")
    public ResponseEntity<String> syncJobs() {
        employmentDataService.synchronizePublicJobs();
        return ResponseEntity.ok("채용공고 동기화가 시작되었습니다!");
    }

    @Operation(summary = "채용박람회 데이터 동기화", description = "Work24 API를 통해 채용박람회 데이터를 수동으로 동기화합니다.")
    @GetMapping("/sync/events")
    public ResponseEntity<String> syncEvents() {
        employmentDataService.synchronizeEvents();
        return ResponseEntity.ok("채용박람회 동기화가 시작되었습니다!");
    }

    @Operation(summary = "기업 데이터 동기화", description = "Work24 API를 통해 기업 데이터를 수동으로 동기화합니다.")
    @GetMapping("/sync/companies")
    public ResponseEntity<String> syncCompanies() {
        employmentDataService.synchronizeCompanies();
        try{
             employmentDataService.SyncDartInfo();
        } catch(Exception e){
            System.out.println("Dart synchronization failed: " + e.getMessage());
        }
        return ResponseEntity.ok("기업 데이터 동기화가 시작되었습니다!");
    }
}