package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirepicker.dto.PendingCompanyApprovalDto;
import com.hirepicker.entity.ApprovalStatus;
import com.hirepicker.entity.Certification;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.CompanyUser;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.JobPostingStatus;
import com.hirepicker.entity.School;
import com.hirepicker.repository.CertificationRepository;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.CompanyUserRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.repository.SchoolRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManageService {

    private static final String RAPID_SOURCE = "RAPIDAPI_ACTIVE_JOBS_DB"; // RapidAPI 출처 식별 문자열
    private static final String JSEARCH_SOURCE = "RAPIDAPI_JSEARCH"; // JSearch 출처 식별 문자열
    private static final int TITLE_MAX_LENGTH = 255;
    private static final int EMPLOYMENT_TYPE_MAX_LENGTH = 50;
    private static final int EXPERIENCE_LEVEL_MAX_LENGTH = 20;
    private static final int SALARY_INFO_MAX_LENGTH = 1000;
    private static final int LOCATION_MAX_LENGTH = 100;
    private static final int JOB_TYPE_MAX_LENGTH = 30;
    private static final int COUNTRY_MAX_LENGTH = 100;
    private static final int SALARY_UNIT_MAX_LENGTH = 20;
    private static final int APPLY_URL_MAX_LENGTH = 500; // 지원 링크 최대 길이
    private static final int IMAGE_PATH_MAX_LENGTH = 1000;
    private static final int EXTERNAL_ID_MAX_LENGTH = 255;

    private final SchoolRepository schoolRepository;
    private final CertificationRepository certificationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository;
    private final CompanyUserRepository companyUserRepository;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${school-key}")
    private String schoolKey;

    @Value("${certification-key}")
    private String certificationKey;

    @Value("${rapidapi.jobsdb.key:}")
    private String rapidApiKey;

    @Value("${rapidapi.jobsdb.host:active-jobs-db.p.rapidapi.com}")
    private String rapidApiHost;

    @Value("${rapidapi.jobsdb.endpoint:active-ats-7d}")
    private String rapidApiEndpoint;

    @Value("${rapidapi.jobsdb.limit}")
    private int rapidApiLimit;

    @Value("${rapidapi.jobsdb.offset}")
    private int rapidApiOffset;

    @Value("${rapidapi.jobsdb.page-count:1}")
    private int rapidApiPageCount;

    @Value("${rapidapi.jobsdb.title-filter:}")
    private String rapidApiTitleFilter;

    @Value("${rapidapi.jobsdb.location-filter:}")
    private String rapidApiLocationFilter;

    @Value("${rapidapi.jobsdb.sort-by:}")
    private String rapidApiSortBy;

    @Value("${rapidapi.jobsdb.order:}")
    private String rapidApiOrder;

    @Value("${rapidapi.jsearch.key:}") // JSearch API 키
    private String jsearchApiKey;

    @Value("${rapidapi.jsearch.host:jsearch.p.rapidapi.com}") // JSearch 호스트
    private String jsearchApiHost;

    @Value("${rapidapi.jsearch.query:}") // JSearch 검색 쿼리
    private String jsearchQuery;

    @Value("${rapidapi.jsearch.country:us}") // 검색 국가 코드
    private String jsearchCountry;

    @Value("${rapidapi.jsearch.language:en}") // 검색 언어 코드
    private String jsearchLanguage;

    @Value("${rapidapi.jsearch.date-posted:all}") // 게시 기간 필터
    private String jsearchDatePosted;

    @Value("${rapidapi.jsearch.page:1}") // 시작 페이지 번호
    private int jsearchStartPage;

    @Value("${rapidapi.jsearch.num-pages:1}") // 조회할 페이지 수
    private int jsearchNumPages;

    @Transactional(readOnly = true)
    public List<PendingCompanyApprovalDto> getPendingCompanyApprovals() {
        // 승인 대기 중인 기업회원만 모아 관리자에게 전달
        return companyUserRepository.findByIsApproved(ApprovalStatus.PENDING)
                .stream()
                .map(user -> {
                    Company company = user.getCompany();
                    return PendingCompanyApprovalDto.builder()
                            .companyUserId(user.getId())
                            .companyId(company != null ? company.getCompanyIdx() : null)
                            .companyName(company != null ? company.getCompanyName() : null)
                            .contactName(user.getName())
                            .contactEmail(user.getEmail())
                            .contactPhone(user.getPhoneNumber())
                            .verificationFileUrl(user.getVerificationFile()) // S3 인증 서류 URL 전달
                            .submittedDate(user.getRegDate())
                            .approvalStatus(user.getIsApproved())
                            .build();
                })
                .toList();
    }

    @Transactional
    public void approveCompanyUser(Long companyUserId) {
        CompanyUser companyUser = companyUserRepository.findById(companyUserId)
                .orElseThrow(() -> new IllegalArgumentException("승인 대상 기업회원이 존재하지 않습니다."));

        companyUser.setIsApproved(ApprovalStatus.APPROVED); // 승인 상태 갱신
        companyUser.setModDate(LocalDate.now()); // 승인일 갱신
        companyUserRepository.save(companyUser); // 변경사항 저장
    }

    // === RapidAPI 채용공고 ===
    @Transactional
    public ResponseEntity<String> importRapidApiJobPostings() {
        String apiKey = validateApiKey(rapidApiKey, "rapidapi.jobsdb.key");
        if (apiKey == null) {
            return ResponseEntity.status(500).body("RapidAPI 키가 설정되지 않았습니다. (rapidapi.jobsdb.key)");
        }

        try {
            String titleFilter = (rapidApiTitleFilter == null) ? "" : rapidApiTitleFilter.trim();
            String locationFilter = (rapidApiLocationFilter == null) ? "" : rapidApiLocationFilter.trim();
            String sortBy = (rapidApiSortBy == null) ? "" : rapidApiSortBy.trim();
            String order = (rapidApiOrder == null) ? "" : rapidApiOrder.trim();

            int effectiveLimit = Math.max(10, Math.min(rapidApiLimit, 100));
            int effectivePageCount = Math.max(1, rapidApiPageCount);
            int baseOffset = Math.max(0, rapidApiOffset);

            int createdTotal = 0;
            int skippedTotal = 0;
            int emptyResponses = 0;
            Set<String> processedPostingIds = new HashSet<>();

            for (int page = 0; page < effectivePageCount; page++) {
                int currentOffset = baseOffset + (page * effectiveLimit);

                StringBuilder uriBuilder = new StringBuilder();
                uriBuilder.append("https://")
                        .append(rapidApiHost)
                        .append("/")
                        .append(rapidApiEndpoint)
                        .append("?limit=").append(effectiveLimit)
                        .append("&offset=").append(currentOffset)
                        .append("&description_type=text");

                if (!titleFilter.isBlank()) {
                    uriBuilder.append("&title_filter=").append(encodeQueryValue(titleFilter));
                }
                if (!locationFilter.isBlank()) {
                    uriBuilder.append("&location_filter=").append(encodeQueryValue(locationFilter));
                }
                if (!sortBy.isBlank()) {
                    uriBuilder.append("&sort_by=").append(encodeQueryValue(sortBy));
                }
                if (!order.isBlank()) {
                    uriBuilder.append("&order=").append(encodeQueryValue(order));
                }

                String uri = uriBuilder.toString();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(uri))
                        .header("x-rapidapi-key", apiKey)
                        .header("x-rapidapi-host", rapidApiHost)
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() != 200) {
                    return ResponseEntity.status(response.statusCode())
                            .body("RapidAPI 요청 실패(offset=" + currentOffset + "): " + response.body());
                }

                JsonNode root = objectMapper.readTree(response.body());
                if (!root.isArray() || root.isEmpty()) {
                    emptyResponses++;
                    continue;
                }

                for (JsonNode jobNode : root) {
                    String postingId = safeText(jobNode, "id");
                    if (postingId == null || postingId.isBlank()) {
                        skippedTotal++;
                        continue;
                    }

                    if (!processedPostingIds.add(postingId)) {
                        skippedTotal++;
                        continue;
                    }

                    if (jobPostingRepository.findByPostingId(postingId).isPresent()) {
                        skippedTotal++;
                        continue;
                    }

                    Company company = resolveCompany(jobNode);
                    JobPosting newPosting = JobPosting.builder()
                            .postingId(postingId)
                            .externalId(truncate(extractExternalId(jobNode, postingId), EXTERNAL_ID_MAX_LENGTH))
                            .sourceApi(RAPID_SOURCE)
                            .company(company)
                            .title(truncate(safeText(jobNode, "title"), TITLE_MAX_LENGTH))
                            .welfare(extractWelfare(jobNode))
                            .description(extractDescription(jobNode))
                            .requiredQualifications(extractRequiredQualifications(jobNode))
                            .preferredQualifications(extractPreferredQualifications(jobNode))
                            .employmentType(truncate(extractEmploymentType(jobNode), EMPLOYMENT_TYPE_MAX_LENGTH))
                            .experienceLevel(truncate(extractExperienceLevel(jobNode), EXPERIENCE_LEVEL_MAX_LENGTH))
                            .salaryInfo(truncate(extractSalaryInfo(jobNode), SALARY_INFO_MAX_LENGTH))
                            .salaryMin(extractSalaryMin(jobNode))
                            .salaryMax(extractSalaryMax(jobNode))
                            .salaryUnit(truncate(extractSalaryUnit(jobNode), SALARY_UNIT_MAX_LENGTH))
                            .location(truncate(extractLocation(jobNode), LOCATION_MAX_LENGTH))
                            .jobType(truncate(extractJobType(jobNode), JOB_TYPE_MAX_LENGTH))
                            .country(truncate(extractCountry(jobNode), COUNTRY_MAX_LENGTH))
                            .status(JobPostingStatus.OPEN)
                            .applyUrl(truncate(extractApplyUrl(jobNode), APPLY_URL_MAX_LENGTH))
                            .imagePath(truncate(safeText(jobNode, "organization_logo"), IMAGE_PATH_MAX_LENGTH))
                            .startDate(parsePostedDate(jobNode.path("date_posted").asText(null)))
                            .endDate(parsePostedDate(jobNode.path("valid_through").asText(null)))
                            .build();

                    jobPostingRepository.save(newPosting);
                    createdTotal++;
                }
            }

            if (createdTotal == 0 && skippedTotal == 0) {
                return ResponseEntity.ok("요청한 페이지 범위에서 신규 공고를 찾지 못했습니다.");
            }

            StringBuilder summary = new StringBuilder();
            summary.append("신규 공고 ").append(createdTotal).append("건 저장, 기존 ").append(skippedTotal).append("건은 건너뜀");
            if (emptyResponses > 0) {
                summary.append(" (빈 응답 페이지 ").append(emptyResponses).append("개)");
            }
            return ResponseEntity.ok(summary.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("RapidAPI 공고 수집 실패: " + e.getMessage());
        }
    }

    private String encodeQueryValue(String value) {
        if (value == null) {
            return "";
        }
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }

    @Transactional
    // JSearch API에서 채용공고를 수집하는 메서드
    public ResponseEntity<String> importJSearchJobPostings() {
        String apiKey = validateApiKey(jsearchApiKey, "rapidapi.jsearch.key");
        if (apiKey == null) {
            return ResponseEntity.status(500).body("RapidAPI JSearch 키가 설정되지 않았습니다. (rapidapi.jsearch.key)");
        }

        String query = (jsearchQuery == null) ? "" : jsearchQuery.trim();
        if (query.isEmpty()) {
            return ResponseEntity.status(500).body("rapidapi.jsearch.query 값을 설정해 주세요.");
        }

        try {
            int effectiveNumPages = Math.max(1, jsearchNumPages);
            int startPage = Math.max(1, jsearchStartPage);

            int createdTotal = 0;
            int skippedTotal = 0;
            int emptyResponses = 0;
            Set<String> processedPostingIds = new HashSet<>();
            String errorMessage = null;

            for (int idx = 0; idx < effectiveNumPages; idx++) {
                int currentPage = startPage + idx;

                StringBuilder uriBuilder = new StringBuilder();
                uriBuilder.append("https://")
                        .append(jsearchApiHost)
                        .append("/search?query=").append(encodeQueryValue(query))
                        .append("&page=").append(currentPage)
                        .append("&num_pages=1");

                if (jsearchCountry != null && !jsearchCountry.isBlank()) {
                    uriBuilder.append("&country=").append(encodeQueryValue(jsearchCountry.trim()));
                }
                if (jsearchLanguage != null && !jsearchLanguage.isBlank()) {
                    uriBuilder.append("&language=").append(encodeQueryValue(jsearchLanguage.trim()));
                }
                if (jsearchDatePosted != null && !jsearchDatePosted.isBlank()) {
                    uriBuilder.append("&date_posted=").append(encodeQueryValue(jsearchDatePosted.trim()));
                }

                String uri = uriBuilder.toString();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(uri))
                        .header("x-rapidapi-key", apiKey)
                        .header("x-rapidapi-host", jsearchApiHost)
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() != 200) {
                    errorMessage = "HTTP " + response.statusCode() + " - " + response.body();
                    break;
                }

                JsonNode root = objectMapper.readTree(response.body());
                if (!"OK".equalsIgnoreCase(root.path("status").asText())) {
                    String msg = root.path("error").path("message").asText("JSearch 응답 상태가 OK가 아닙니다.");
                    errorMessage = msg;
                    break;
                }

                JsonNode data = root.path("data");
                if (!data.isArray() || data.isEmpty()) {
                    emptyResponses++;
                    continue;
                }

                for (JsonNode jobNode : data) {
                    String postingId = safeText(jobNode, "job_id");
                    if (postingId == null || postingId.isBlank()) {
                        skippedTotal++;
                        continue;
                    }

                    if (!processedPostingIds.add(postingId)) {
                        skippedTotal++;
                        continue;
                    }

                    if (jobPostingRepository.findByPostingId(postingId).isPresent()) {
                        skippedTotal++;
                        continue;
                    }

                    Company company = resolveCompanyFromJSearch(jobNode);

                    Integer salaryMin = parseSalaryValue(jobNode.path("job_min_salary"));
                    Integer salaryMax = parseSalaryValue(jobNode.path("job_max_salary"));
                    String salaryUnit = truncate(safeText(jobNode, "job_salary_period"), SALARY_UNIT_MAX_LENGTH);
                    String salaryInfo = buildSalaryInfo(salaryMin, salaryMax, salaryUnit, safeText(jobNode, "job_salary_source"));

                    JobPosting newPosting = JobPosting.builder()
                            .postingId(postingId)
                            .externalId(truncate(postingId, EXTERNAL_ID_MAX_LENGTH))
                            .sourceApi(JSEARCH_SOURCE)
                            .company(company)
                            .title(truncate(safeText(jobNode, "job_title"), TITLE_MAX_LENGTH))
                            .welfare(extractJSearchBenefits(jobNode))
                            .description(safeText(jobNode, "job_description"))
                            .requiredQualifications(extractJSearchHighlights(jobNode, "Qualifications"))
                            .preferredQualifications(extractJSearchHighlights(jobNode, "Responsibilities"))
                            .employmentType(truncate(extractJSearchEmploymentType(jobNode), EMPLOYMENT_TYPE_MAX_LENGTH))
                            .experienceLevel(truncate(safeText(jobNode, "job_onet_job_zone"), EXPERIENCE_LEVEL_MAX_LENGTH))
                            .salaryInfo(truncate(salaryInfo, SALARY_INFO_MAX_LENGTH))
                            .salaryMin(salaryMin)
                            .salaryMax(salaryMax)
                            .salaryUnit(salaryUnit)
                            .location(truncate(safeText(jobNode, "job_location"), LOCATION_MAX_LENGTH))
                            .jobType(truncate(firstNonBlank(jobNode, "job_onet_soc", "job_publisher"), JOB_TYPE_MAX_LENGTH))
                            .country(truncate(safeText(jobNode, "job_country"), COUNTRY_MAX_LENGTH))
                            .status(JobPostingStatus.OPEN)
                            .applyUrl(truncate(extractJSearchApplyUrl(jobNode), APPLY_URL_MAX_LENGTH))
                            .imagePath(truncate(safeText(jobNode, "employer_logo"), IMAGE_PATH_MAX_LENGTH))
                            .startDate(parseJSearchDate(jobNode, "job_posted_at_datetime_utc", "job_posted_at_timestamp"))
                            .endDate(parseJSearchDate(jobNode, "job_expiration_datetime_utc", "job_expiration_timestamp"))
                            .build();

                    jobPostingRepository.save(newPosting);
                    createdTotal++;
                }
            }

            if (createdTotal == 0 && skippedTotal == 0) {
                if (errorMessage != null) {
                    return ResponseEntity.status(500).body("JSearch 공고 수집 실패: " + errorMessage);
                }
                return ResponseEntity.ok("JSearch 요청 범위에서 신규 공고를 찾지 못했습니다.");
            }

            StringBuilder summary = new StringBuilder();
            summary.append("JSearch 신규 공고 ").append(createdTotal).append("건 저장, 기존 ")
                    .append(skippedTotal).append("건은 건너뜀");
            if (emptyResponses > 0) {
                summary.append(" (빈 페이지 ").append(emptyResponses).append("개)");
            }
            if (errorMessage != null) {
                summary.append(" — 중간에 수집이 중단됨: ").append(errorMessage);
            }
            return ResponseEntity.ok(summary.toString());
        } catch (Exception e) {
            e.printStackTrace();
            String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            if (message.isBlank()) {
                message = e.getClass().getName();
            }
            return ResponseEntity.status(500).body("JSearch 공고 수집 실패: " + message);
        }
    }

    private Company resolveCompany(JsonNode jobNode) {
        String organizationName = safeText(jobNode, "organization");
        if (organizationName == null || organizationName.isBlank()) {
            organizationName = "미상 기업";
        }

        String slug = slugify(organizationName);
        String generatedCompanyId = "rapid-" + slug;

        Optional<Company> byId = companyRepository.findByCompanyId(generatedCompanyId);
        if (byId.isPresent()) {
            return byId.get();
        }

        Optional<Company> byName = companyRepository.findByCompanyName(organizationName);
        if (byName.isPresent()) {
            return byName.get();
        }

        Company company = Company.builder()
                .companyId(generatedCompanyId)
                .companyName(organizationName)
                .websiteUrl(safeText(jobNode, "organization_url"))
                .logoUrl(safeText(jobNode, "organization_logo"))
                .status("PENDING")
                .build();
        return companyRepository.save(company);
    }

    private String slugify(String value) {
        String slug = value.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (slug.isBlank()) {
            slug = "company";
        }
        return slug.length() > 40 ? slug.substring(0, 40) : slug;
    }

    // RapidAPI 응답에서 설명 텍스트를 추출
    private String extractDescription(JsonNode jobNode) {
        String direct = firstNonBlank(jobNode, "description_text", "description");
        if (direct != null) {
            return direct;
        }
        return firstNonBlank(jobNode, "summary_text", "short_description");
    }

    // RapidAPI 응답에서 복리후생 정보를 추출
    private String extractWelfare(JsonNode jobNode) {
        String text = firstNonBlank(jobNode, "benefits_text", "perks_text", "compensation_text");
        if (text != null) {
            return text;
        }
        JsonNode aiBenefits = jobNode.path("ai_benefits");
        if (aiBenefits.isArray() && aiBenefits.size() > 0) {
            return String.join("\n", nodeToTextList(aiBenefits));
        }
        return null;
    }

    // RapidAPI 응답에서 필수 자격요건을 추출
    private String extractRequiredQualifications(JsonNode jobNode) {
        String text = firstNonBlank(jobNode, "requirements_text", "qualifications_primary_text");
        if (text != null) {
            return text;
        }
        JsonNode aiRequirements = jobNode.path("ai_requirements");
        if (aiRequirements.isArray() && aiRequirements.size() > 0) {
            return String.join("\n", nodeToTextList(aiRequirements));
        }
        if (aiRequirements.isTextual()) {
            return aiRequirements.asText();
        }
        return null;
    }

    // RapidAPI 응답에서 우대 자격요건을 추출
    private String extractPreferredQualifications(JsonNode jobNode) {
        String text = firstNonBlank(jobNode, "qualifications_secondary_text", "preferred_qualifications_text");
        if (text != null) {
            return text;
        }
        JsonNode aiPreferred = jobNode.path("ai_preferred_requirements");
        if (aiPreferred.isArray() && aiPreferred.size() > 0) {
            return String.join("\n", nodeToTextList(aiPreferred));
        }
        if (aiPreferred.isTextual()) {
            return aiPreferred.asText();
        }
        return null;
    }

    private String extractEmploymentType(JsonNode jobNode) {
        JsonNode employmentNode = jobNode.path("employment_type");
        if (employmentNode.isArray() && employmentNode.size() > 0) {
            List<String> list = new ArrayList<>();
            employmentNode.forEach(node -> list.add(node.asText()));
            return String.join(", ", list);
        }
        JsonNode aiEmployment = jobNode.path("ai_employment_type");
        if (aiEmployment.isArray() && aiEmployment.size() > 0) {
            List<String> list = new ArrayList<>();
            aiEmployment.forEach(node -> list.add(node.asText()));
            return String.join(", ", list);
        }
        return null;
    }

    // RapidAPI 응답에서 급여 하한값을 정수로 추출
    private Integer extractSalaryMin(JsonNode jobNode) {
        Integer min = parseSalaryValue(jobNode.path("ai_salary_minvalue"));
        if (min != null) {
            return min;
        }
        return parseSalaryValue(jobNode.path("salary_min"));
    }

    // RapidAPI 응답에서 급여 상한값을 정수로 추출
    private Integer extractSalaryMax(JsonNode jobNode) {
        Integer max = parseSalaryValue(jobNode.path("ai_salary_maxvalue"));
        if (max != null) {
            return max;
        }
        return parseSalaryValue(jobNode.path("salary_max"));
    }

    // RapidAPI 응답에서 급여 단위를 추출
    private String extractSalaryUnit(JsonNode jobNode) {
        String unit = firstNonBlank(jobNode, "ai_salary_unittext", "salary_unit", "salary_time_unit");
        if (unit != null) {
            return unit;
        }
        JsonNode aiFrequency = jobNode.path("ai_salary_frequency");
        if (aiFrequency.isTextual()) {
            return aiFrequency.asText();
        }
        return null;
    }

    private String extractExperienceLevel(JsonNode jobNode) {
        JsonNode aiExperience = jobNode.path("ai_experience_level");
        if (aiExperience.isArray() && aiExperience.size() > 0) {
            return String.join(", ", nodeToTextList(aiExperience));
        }
        if (aiExperience.isTextual()) {
            return aiExperience.asText();
        }
        return null;
    }

    private List<String> nodeToTextList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        arrayNode.forEach(node -> list.add(node.asText()));
        return list;
    }

    private String extractSalaryInfo(JsonNode jobNode) {
        JsonNode salaryRaw = jobNode.path("salary_raw");
        if (!salaryRaw.isMissingNode() && !salaryRaw.isNull() && !salaryRaw.isEmpty()) {
            return salaryRaw.toString();
        }
        JsonNode aiCurrency = jobNode.path("ai_salary_currency");
        JsonNode aiMin = jobNode.path("ai_salary_minvalue");
        JsonNode aiMax = jobNode.path("ai_salary_maxvalue");
        JsonNode aiUnit = jobNode.path("ai_salary_unittext");
        if (!aiCurrency.isMissingNode() && !aiCurrency.isNull()) {
            StringBuilder sb = new StringBuilder();
            sb.append(aiCurrency.asText());
            if (!aiMin.isMissingNode() && !aiMin.isNull()) {
                sb.append(" ").append(aiMin.asText());
            }
            if (!aiMax.isMissingNode() && !aiMax.isNull() && !aiMax.asText().equals(aiMin.asText())) {
                sb.append(" - ").append(aiMax.asText());
            }
            if (!aiUnit.isMissingNode() && !aiUnit.isNull()) {
                sb.append(" (per ").append(aiUnit.asText()).append(")");
            }
            return sb.toString();
        }
        return null;
    }

    private String extractJobType(JsonNode jobNode) {
        JsonNode taxonomy = jobNode.path("ai_taxonomies_a");
        if (taxonomy.isArray() && taxonomy.size() > 0) {
            return taxonomy.get(0).asText();
        }
        return null;
    }

    // RapidAPI 응답에서 근무 지역 정보를 정규화
    private String extractLocation(JsonNode jobNode) {
        String derived = joinArray(jobNode.path("locations_derived"));
        if (derived != null && !derived.isBlank()) {
            return derived;
        }
        String aiCity = joinArray(jobNode.path("ai_locations_city"));
        if (aiCity != null && !aiCity.isBlank()) {
            return aiCity;
        }
        String manual = firstNonBlank(jobNode, "location", "city", "region");
        if (manual != null) {
            return manual;
        }
        JsonNode locations = jobNode.path("locations");
        if (locations.isArray() && locations.size() > 0) {
            return String.join(", ", nodeToTextList(locations));
        }
        return null;
    }

    private String extractCountry(JsonNode jobNode) {
        JsonNode derived = jobNode.path("locations_derived");
        if (derived.isArray() && derived.size() > 0) {
            String first = derived.get(0).asText();
            if (first != null && !first.isBlank()) {
                return first;
            }
        }

        JsonNode aiCountry = jobNode.path("ai_locations_country");
        if (aiCountry.isArray() && aiCountry.size() > 0) {
            String first = aiCountry.get(0).asText();
            if (first != null && !first.isBlank()) {
                return first;
            }
        } else if (aiCountry.isTextual()) {
            String value = aiCountry.asText();
            if (value != null && !value.isBlank()) {
                return value;
            }
        }

        String country = safeText(jobNode, "country");
        if (country != null && !country.isBlank()) {
            return country;
        }
        return safeText(jobNode, "organization_country");
    }

    // RapidAPI 응답에서 지원 링크를 추출
    private String extractApplyUrl(JsonNode jobNode) {
        String value = firstNonBlank(jobNode,
                "apply_url",
                "application_url",
                "job_url",
                "canonical_url",
                "url");
        if (value == null) {
            JsonNode applyUrls = jobNode.path("application_urls");
            if (applyUrls.isArray() && applyUrls.size() > 0) {
                value = applyUrls.get(0).asText();
            }
        }
        if (value != null && value.length() > APPLY_URL_MAX_LENGTH) {
            return value.substring(0, APPLY_URL_MAX_LENGTH);
        }
        return value != null ? value.trim() : null;
    }

    private String extractJSearchEmploymentType(JsonNode jobNode) {
        String direct = safeText(jobNode, "job_employment_type");
        if (direct != null && !direct.isBlank()) {
            return direct;
        }
        JsonNode types = jobNode.path("job_employment_types");
        if (types.isArray() && types.size() > 0) {
            return String.join(", ", nodeToTextList(types));
        }
        return null;
    }

    private String extractJSearchHighlights(JsonNode jobNode, String key) {
        JsonNode highlights = jobNode.path("job_highlights");
        if (!highlights.isObject()) {
            return null;
        }
        JsonNode section = highlights.path(key);
        if (section.isArray() && section.size() > 0) {
            return String.join("\n", nodeToTextList(section));
        }
        return null;
    }

    private String extractJSearchBenefits(JsonNode jobNode) {
        JsonNode benefits = jobNode.path("job_benefits");
        if (benefits.isArray() && benefits.size() > 0) {
            return String.join("\n", nodeToTextList(benefits));
        }
        return null;
    }

    private String extractJSearchApplyUrl(JsonNode jobNode) {
        String primary = safeText(jobNode, "job_apply_link");
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        JsonNode applyOptions = jobNode.path("apply_options");
        if (applyOptions.isArray() && applyOptions.size() > 0) {
            for (JsonNode option : applyOptions) {
                String link = safeText(option, "apply_link");
                if (link != null && !link.isBlank()) {
                    return link;
                }
            }
        }
        return null;
    }

    private String buildSalaryInfo(Integer min, Integer max, String unit, String source) {
        if (min == null && max == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        if (min != null) {
            sb.append(min);
        }
        if (max != null) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(max);
        }
        if (unit != null && !unit.isBlank()) {
            sb.append(" (per ").append(unit).append(")");
        }
        if (source != null && !source.isBlank()) {
            sb.append(" [").append(source).append("]");
        }
        return sb.toString();
    }

    private LocalDate parseJSearchDate(JsonNode jobNode, String isoField, String timestampField) {
        String isoValue = safeText(jobNode, isoField);
        if (isoValue != null && !isoValue.isBlank()) {
            try {
                return OffsetDateTime.parse(isoValue).toLocalDate();
            } catch (Exception ignored) {
            }
        }
        JsonNode timestampNode = jobNode.path(timestampField);
        if (timestampNode.isNumber()) {
            try {
                long seconds = timestampNode.asLong();
                return java.time.Instant.ofEpochSecond(seconds).atOffset(java.time.ZoneOffset.UTC).toLocalDate();
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private Company resolveCompanyFromJSearch(JsonNode jobNode) {
        String employerName = safeText(jobNode, "employer_name");
        if (employerName == null || employerName.isBlank()) {
            employerName = "미상 기업";
        }

        String slug = slugify(employerName);
        String generatedCompanyId = "jsearch-" + slug;

        Optional<Company> byId = companyRepository.findByCompanyId(generatedCompanyId);
        if (byId.isPresent()) {
            return updateCompanyFromJSearch(byId.get(), jobNode);
        }

        Optional<Company> byName = companyRepository.findByCompanyName(employerName);
        if (byName.isPresent()) {
            return updateCompanyFromJSearch(byName.get(), jobNode);
        }

        Company company = Company.builder()
                .companyId(generatedCompanyId)
                .companyName(employerName)
                .websiteUrl(truncate(safeText(jobNode, "employer_website"), 255))
                .logoUrl(truncate(safeText(jobNode, "employer_logo"), IMAGE_PATH_MAX_LENGTH))
                .status("PENDING")
                .build();
        return companyRepository.save(company);
    }

    private Company updateCompanyFromJSearch(Company company, JsonNode jobNode) {
        String website = safeText(jobNode, "employer_website");
        if (website != null && !website.isBlank() && (company.getWebsiteUrl() == null || company.getWebsiteUrl().isBlank())) {
            company.setWebsiteUrl(truncate(website, 255));
        }

        String logo = safeText(jobNode, "employer_logo");
        if (logo != null && !logo.isBlank() && (company.getLogoUrl() == null || company.getLogoUrl().isBlank())) {
            company.setLogoUrl(truncate(logo, IMAGE_PATH_MAX_LENGTH));
        }

        return companyRepository.save(company);
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength);
    }

    // RapidAPI 응답에서 외부 식별자를 추출
    private String extractExternalId(JsonNode jobNode, String fallback) {
        String value = firstNonBlank(jobNode,
                "external_id",
                "job_reference",
                "reference_id",
                "posting_id",
                "job_uuid");
        if (value != null) {
            return value;
        }
        return fallback;
    }

    private LocalDate parsePostedDate(String isoDateTime) {
        if (isoDateTime == null || isoDateTime.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(isoDateTime).toLocalDate();
        } catch (Exception e) {
            try {
                return LocalDate.parse(isoDateTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception ex) {
                return null;
            }
        }
    }

    // 급여 문자열을 정수로 변환
    private Integer parseSalaryValue(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        try {
            if (node.isNumber()) {
                return (int) Math.round(node.asDouble());
            }
            String text = node.asText();
            if (text == null) {
                return null;
            }
            String normalized = text.replaceAll("[^0-9+\\-.]", "");
            if (normalized.isBlank()) {
                return null;
            }
            double value = Double.parseDouble(normalized);
            return (int) Math.round(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // 여러 후보 필드 중 첫 번째 유효 문자열을 반환
    private String firstNonBlank(JsonNode jobNode, String... fields) {
        for (String field : fields) {
            String value = safeText(jobNode, field);
            if (value != null) {
                String trimmed = value.trim();
                if (!trimmed.isBlank()) {
                    return trimmed;
                }
            }
        }
        return null;
    }

    private String joinArray(JsonNode node) {
        if (node == null || !node.isArray() || node.size() == 0) {
            return null;
        }
        List<String> list = new ArrayList<>();
        node.forEach(value -> list.add(value.asText()));
        return String.join(", ", list);
    }

    private String safeText(JsonNode node, String field) {
        JsonNode target = node.path(field);
        if (target.isMissingNode() || target.isNull()) {
            return null;
        }
        return target.asText();
    }

    // === 학교 데이터 ===
    public ResponseEntity<String> updateSchool() {
        List<Map<String, Object>> schoolList = fetchSchoolData();
        if (schoolList.isEmpty()) {
            return ResponseEntity.status(500).body("Error: Failed to fetch school data");
        }
        try {
            saveSchoolData(schoolList);
            return ResponseEntity.ok("Successfully processed " + schoolList.size() + " schools");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: Failed to save school data to database");
        }
    }

    public List<Map<String, Object>> fetchSchoolData() {
        String apiKey = validateApiKey(schoolKey, "school-key");
        if (apiKey == null) return List.of();

        String baseUrlString = "https://www.career.go.kr/cnet/openapi/getOpenApi?apiKey=" + apiKey
                + "&svcType=api&svcCode=SCHOOL&contentType=json&perPage=3000";

        List<Map<String, Object>> all = new ArrayList<>();
        try {
            List<Map<String, Object>> univ = fetchSchoolDataByType(baseUrlString, "univ_list");
            if (!univ.isEmpty()) all.addAll(univ);

            List<Map<String, Object>> high = fetchSchoolDataByType(baseUrlString, "high_list");
            if (!high.isEmpty()) all.addAll(high);

            return all;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private List<Map<String, Object>> fetchSchoolDataByType(String baseUrlString, String gubun) {
        try {
            URL url = new URL(baseUrlString + "&gubun=" + gubun);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            int code = conn.getResponseCode();
            if (code == HttpURLConnection.HTTP_OK) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) sb.append(line);
                    return parseSchoolData(sb.toString());
                }
            } else {
                System.err.println("Career API call failed: " + code);
                return List.of();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private List<Map<String, Object>> parseSchoolData(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            JsonNode dataSearch = root.path("dataSearch");
            if (dataSearch.isMissingNode() || dataSearch.isNull()) return List.of();

            JsonNode content = dataSearch.path("content");
            if (!content.isArray()) return List.of();

            List<Map<String, Object>> list = new ArrayList<>();
            for (JsonNode elem : content) {
                Map<String, Object> map = objectMapper.convertValue(elem, new TypeReference<Map<String, Object>>() {});
                list.add(map);
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private School convertToSchoolEntity(Map<String, Object> schoolData) {
        School s = new School();
        s.setSchoolName((String) schoolData.get("schoolName"));
        s.setSchoolType((String) schoolData.get("schoolType"));
        s.setAddress((String) schoolData.get("adres"));
        s.setCampus((String) schoolData.get("campusName"));
        s.setSchoolUrl((String) schoolData.get("link"));
        return s;
    }

    private void saveSchoolData(List<Map<String, Object>> schoolList) {
        int insertCount = 0;
        int updateCount = 0;

        for (Map<String, Object> data : schoolList) {
            School newSchool = convertToSchoolEntity(data);
            Optional<School> existing = schoolRepository.findBySchoolNameAndCampus(newSchool.getSchoolName(), newSchool.getCampus());
            if (existing.isPresent()) {
                School u = existing.get();
                u.setSchoolType(newSchool.getSchoolType());
                u.setAddress(newSchool.getAddress());
                u.setSchoolUrl(newSchool.getSchoolUrl());
                schoolRepository.save(u);
                updateCount++;
            } else {
                schoolRepository.save(newSchool);
                insertCount++;
            }
        }
        System.out.println("School upsert done. inserted=" + insertCount + ", updated=" + updateCount);
    }

    // === 자격증 데이터 ===
    public ResponseEntity<String> updateCertification() {
        List<Map<String, Object>> certList = fetchCertificationData();
        if (certList.isEmpty()) {
            return ResponseEntity.status(500).body("Error: Failed to fetch certification data");
        }
        try {
            saveCertificationData(certList);
            return ResponseEntity.ok("Successfully processed " + certList.size() + " certifications");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: Failed to save certification data to database");
        }
    }

    public List<Map<String, Object>> fetchCertificationData() {
        String apiKey = validateApiKey(certificationKey, "certification-key");
        if (apiKey == null) return List.of();

        String apiUrl = "http://openapi.q-net.or.kr/api/service/rest/"
                + "InquiryListNationalQualifcationSVC/getList?serviceKey=" + apiKey + "&_type=json";
        try {
            URL url = new URL(apiUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            int code = conn.getResponseCode();
            if (code == HttpURLConnection.HTTP_OK) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) sb.append(line);
                    return parseCertificationData(sb.toString());
                }
            } else {
                System.err.println("Q-Net API call failed: " + code);
                return List.of();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private List<Map<String, Object>> parseCertificationData(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            JsonNode response = root.path("response");
            if (response.isMissingNode() || response.isNull()) return List.of();

            JsonNode header = response.path("header");
            if (!header.isMissingNode() && !header.isNull()) {
                String resultCode = header.path("resultCode").asText("");
                String resultMsg = header.path("resultMsg").asText("");
                if (!"00".equals(resultCode)) {
                    System.err.println("Q-Net API error: " + resultMsg);
                    return List.of();
                }
            }

            JsonNode body = response.path("body");
            if (body.isMissingNode() || body.isNull()) return List.of();

            JsonNode items = body.path("items");
            if (items.isMissingNode() || items.isNull()) return List.of();

            JsonNode itemNode = items.path("item");
            if (itemNode.isMissingNode() || itemNode.isNull()) return List.of();

            List<Map<String, Object>> list = new ArrayList<>();
            if (itemNode.isArray()) {
                for (JsonNode elem : itemNode) {
                    list.add(objectMapper.convertValue(elem, new TypeReference<Map<String, Object>>() {}));
                }
            } else if (itemNode.isObject()) {
                list.add(objectMapper.convertValue(itemNode, new TypeReference<Map<String, Object>>() {}));
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private Certification convertToCertificationEntity(Map<String, Object> certData) {
        Certification c = new Certification();
        Object certNameObj = certData.get("jmfldnm");
        if (certNameObj != null) c.setCertName(certNameObj.toString());
        return c;
    }

    private void saveCertificationData(List<Map<String, Object>> certList) {
        List<Certification> existing = certificationRepository.findAll();
        Set<String> existingNames = new HashSet<>();
        for (Certification c : existing) {
            String name = c.getCertName();
            if (name != null && !name.isBlank()) existingNames.add(name);
        }

        int insertCount = 0;
        int skipCount = 0;

        for (Map<String, Object> data : certList) {
            Certification toSave = convertToCertificationEntity(data);
            if (toSave.getCertName() == null || toSave.getCertName().isBlank()) {
                skipCount++;
                continue;
            }
            if (existingNames.contains(toSave.getCertName())) {
                skipCount++;
                continue;
            }
            certificationRepository.save(toSave);
            existingNames.add(toSave.getCertName());
            insertCount++;
        }
        System.out.println("Certification save done. inserted=" + insertCount + ", skipped=" + skipCount);
    }

    private String validateApiKey(String key, String name) {
        if (key == null || key.isBlank()) {
            System.err.println("API key not found: " + name);
            return null;
        }
        return key;
    }
}

