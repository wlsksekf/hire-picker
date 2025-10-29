package com.hirepicker.service;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value; // Ensure this is present
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.entity.Company;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.util.DartCorpCodeSaxHandler;
import com.hirepicker.util.DataMapper;
import com.hirepicker.util.XmlParser;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmploymentDataService {

    private final File dataDir = new File(System.getProperty("user.home"), ".hirepicker_data");
    private final File keyStateFile = new File(dataDir, "dart_key_state.txt");

    private int currentDartKeyIndex = 1;
    private Set<String> exhaustedKeys = new HashSet<>();

    private final Dotenv dotenv;
    private final CompanyRepository companyRepository;
    private final EmploymentDataProcessorService DataProcessorService;

    @Value("${work24-key}")
    private String work24Key;

    // @Value("${dart-key2}")
    // private String dartKey;

    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void scheduledSyncJobs() {
        synchronizePublicJobs();
    }

    @Scheduled(cron = "0 0 5 * * *")
    @Transactional
    public void scheduledSyncEvents() {
        synchronizeEvents();
    }

    // Dart API 가져와서 DB에 저장
    public void SyncDartInfo() {

        // --- 디렉토리 및 파일 세팅 ---
        File buildDir = new File("build");
        if (!buildDir.exists()) {
            buildDir.mkdirs();
        }

        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }

        File downloadedFile = new File(buildDir, "downloaded_dart_data.exe");
        File zipFile = new File(buildDir, "downloaded_dart_data.zip");
        File extractedXmlFile = new File(buildDir, "corpCode.xml");

        // 진행상황 파일은 build 밖에 저장
        File progressFile = new File(dataDir, "dart_sync_progress.txt");

        boolean downloadAndVerificationSuccess = false;

        // --- 여러 DART API 키를 순차적으로 시도 ---
        while (currentDartKeyIndex <= 5 && !downloadAndVerificationSuccess) {
            String apiKey = getDartKey();
            if (apiKey == null) {
                log.error("더 이상 유효한 DART API 키가 없습니다. 동기화를 중단합니다.");
                return;
            }

            try {
                downloadAndVerificationSuccess = downloadAndVerifyCorpCodeXml(apiKey, downloadedFile, zipFile,
                        extractedXmlFile);
            } catch (Exception e) {
                log.error("corpCode.xml 다운로드/검증 중 오류 발생: {}. 다음 키로 시도합니다.", e.getMessage(), e);
                // 다운로드/검증 실패 시 다음 키로 넘어가도록 처리
                exhaustedKeys.add("dart_key" + currentDartKeyIndex);
                currentDartKeyIndex = (currentDartKeyIndex % 5) + 1;
                continue; // 다음 API 키로 재시도
            }

            if (!downloadAndVerificationSuccess) {
                log.warn("현재 DART API 키 ({})로 corpCode.xml 다운로드/검증 실패. 다음 키로 시도합니다.",
                        "dart_key" + currentDartKeyIndex);
                exhaustedKeys.add("dart_key" + currentDartKeyIndex);
                currentDartKeyIndex = (currentDartKeyIndex % 5) + 1;
            }

        }

        // 모든 키로 실패한 경우
        if (!downloadAndVerificationSuccess) {
            log.error("모든 DART API 키로 corpCode.xml 다운로드 실패. 동기화 종료.");
            return;
        }

        try {
            // --- XML 파싱 ---
            SAXParserFactory saxFactory = SAXParserFactory.newInstance();
            SAXParser saxParser = saxFactory.newSAXParser();
            DartCorpCodeSaxHandler handler = new DartCorpCodeSaxHandler();
            saxParser.parse(extractedXmlFile, handler);

            List<Company> allParsedCompanies = handler.getCompanies();
            log.info("파싱된 전체 회사 수: {}", allParsedCompanies.size());

            // --- DB 조회 및 맵핑 ---
            List<Company> allDbCompanies = companyRepository.findAll();
            log.info("DB에 저장된 회사 수: {}", allDbCompanies.size());

            Map<String, Company> companyByCorpCode = new HashMap<>();
            for (Company company : allDbCompanies) {
                String currentCorpCode = company.getCorpCode();
                if (currentCorpCode != null && !currentCorpCode.isEmpty()) {
                    companyByCorpCode.putIfAbsent(currentCorpCode, company);
                }
            }

            Map<String, List<Company>> companiesByName = new HashMap<>();
            for (Company company : allDbCompanies) {
                if (company.getCorpCode() == null || company.getCorpCode().isEmpty()) {
                    companiesByName.computeIfAbsent(company.getCompanyName(), k -> new ArrayList<>()).add(company);
                }
            }

            // --- 이어하기 로직 ---
            int batchSize = 100;
            int totalPages = (int) Math.ceil((double) allParsedCompanies.size() / batchSize);
            int startPage = 0;

            if (progressFile.exists()) {
                try {
                    List<String> lines = Files.readAllLines(progressFile.toPath());
                    if (!lines.isEmpty()) {
                        String lastLine = lines.get(lines.size() - 1).trim(); // 마지막 줄
                        startPage = Integer.parseInt(lastLine);
                        log.info("이전 작업 감지됨 — {} 페이지부터 이어서 시작합니다.", startPage);
                    }
                } catch (Exception e) {
                    log.warn("진행상황 파일 읽기 실패.", e);
                    return;
                }
            }

            // --- 배치 단위 동기화 ---
            for (int page = startPage; page < totalPages; page++) {
                int start = page * batchSize;
                int end = Math.min(start + batchSize, allParsedCompanies.size());
                List<Company> batch = allParsedCompanies.subList(start, end);

                processDartCompanyBatch(batch, page, totalPages, companyByCorpCode, companiesByName);

                // 다음 실행할 페이지 번호 저장
                try (PrintWriter writer = new PrintWriter(new FileWriter(progressFile, true))) { // append 모드
                    writer.println(page);
                } catch (FileNotFoundException e) {
                    log.error("진행상황 파일 저장 오류 (페이지 {}): {}", page + 1, e.getMessage(), e);
                }

                // 배치 간 대기 (API 부하 방지)
                // if (page < totalPages - 1) {
                // try {
                // Thread.sleep(2000);
                // } catch (InterruptedException e) {
                // Thread.currentThread().interrupt();
                // log.error("⏸ 배치 대기 중 인터럽트 발생", e);
                // }
                // }
            }

            // --- 모든 작업 완료 시 진행상황 파일 삭제 ---
            // if (progressFile.exists()) {
            // progressFile.delete();
            // log.info("🧹 진행상황 파일 삭제 완료");
            // }

            log.info("DART 전체 동기화 완료.");

        } catch (Exception e) {
            log.error("DART 동기화 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void synchronizePublicJobs() {
        String apiKey = getWork24Key(); // Call the fixed getter
        if (apiKey == null)
            return;
        log.info("Executing: Job Synchronization");
        List<JobDto> allJobs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) { // 100개씩 5페이지, 총 500개 시도
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L21.do?authKey=" + apiKey
                        + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) {
                    log.error("work24 API Error (Jobs): {}", XmlParser.getTagValueFromRawXml(xml, "error"));
                    continue;
                }
                Document doc = XmlParser.parseXml(xml);
                NodeList nodeList = doc.getElementsByTagName("dhsOpenEmpInfo");
                List<JobDto> pageOfJobs = new ArrayList<>();
                for (int j = 0; j < nodeList.getLength(); j++) {
                    Element e = (Element) nodeList.item(j);
                    JobDto dto = DataMapper.mapToJobDto(e);
                    if (dto != null) {
                        pageOfJobs.add(dto);
                    }
                }
                if (pageOfJobs.isEmpty())
                    break;
                allJobs.addAll(pageOfJobs);
            } catch (Exception e) {
                log.error("Failed to fetch or parse jobs from work24 API for page {}", i, e);
                break; // Stop processing if an error occurs for a page
            }
        }

        for (JobDto dto : allJobs) {
            DataProcessorService.processJobDto(dto);
        }
        log.info("Finished: Job Synchronization. Total items processed: {}", allJobs.size());
    }

    @Transactional
    public void synchronizeEvents() {
        String apiKey = getWork24Key(); // Call the fixed getter
        if (apiKey == null)
            return;
        log.info("Executing: Event Synchronization");
        List<EventDto> allEvents = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L11.do?authKey=" + apiKey
                        + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) {
                    log.error("work24 API Error (Events): {}", XmlParser.getTagValueFromRawXml(xml, "error"));
                    continue;
                }
                Document doc = XmlParser.parseXml(xml);
                NodeList nodeList = doc.getElementsByTagName("empEvent");
                List<EventDto> pageOfEvents = new ArrayList<>();
                for (int j = 0; j < nodeList.getLength(); j++) {
                    Element e = (Element) nodeList.item(j);
                    EventDto dto = DataMapper.mapToEventDto(e);
                    if (dto != null) {
                        pageOfEvents.add(dto);
                    }
                }
                if (pageOfEvents.isEmpty())
                    break;
                allEvents.addAll(pageOfEvents);
            } catch (Exception e) {
                log.error("Failed to fetch or parse events from work24 API for page {}", i, e);
                break; // Stop processing if an error occurs for a page
            }
        }

        for (EventDto dto : allEvents) {
            DataProcessorService.processEventDto(dto);
        }
        log.info("Finished: Event Synchronization. Total items processed: {}", allEvents.size());
    }

    @Transactional
    public void synchronizeCompanies() {
        String apiKey = getWork24Key(); // Call the fixed getter
        if (apiKey == null)
            return;
        log.info("Executing: Company Synchronization");
        List<CompanyDto> allCompanies = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L31.do?authKey=" + apiKey
                        + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) {
                    log.error("work24 API Error (Companies): {}", XmlParser.getTagValueFromRawXml(xml, "error"));
                    continue;
                }
                Document doc = XmlParser.parseXml(xml);
                NodeList nodeList = doc.getElementsByTagName("dhsOpenEmpHireInfo");
                List<CompanyDto> pageOfCompanies = new ArrayList<>();
                for (int j = 0; j < nodeList.getLength(); j++) {
                    Element e = (Element) nodeList.item(j);
                    CompanyDto dto = DataMapper.mapToCompanyDto(e);
                    if (dto != null) {
                        pageOfCompanies.add(dto);
                    }
                }
                if (pageOfCompanies.isEmpty())
                    break;
                allCompanies.addAll(pageOfCompanies);
            } catch (Exception e) {
                log.error("Failed to fetch or parse companies from work24 API for page {}", i, e);
                break; // Stop processing if an error occurs for a page
            }
        }

        for (CompanyDto dto : allCompanies) {
            DataProcessorService.processCompanyDto(dto);
        }
        log.info("Finished: Company Synchronization. Total items processed: {}", allCompanies.size());
    }

    private String getWork24Key() {
        if (work24Key == null || work24Key.isBlank()) {
            System.err.println("CRITICAL: 'work24_key' not found in .env file.");
            return null;
        }

        return work24Key;
    }

    private String getDartKey() {
        for (int i = 0; i < 5; i++) {
            String keyName = "dart_key" + currentDartKeyIndex;
            String apiKey = dotenv.get(keyName);

            if (apiKey != null && !apiKey.isBlank() && !isKeyExhausted(keyName)) {
                log.info("Using DART API Key: {}", keyName);
                writeKeyIndex(currentDartKeyIndex); // key 사용 시 파일에 저장
                return apiKey;
            }

            currentDartKeyIndex = (currentDartKeyIndex % 5) + 1; // 다음 key로 이동
        }

        log.error("모든 DART API Key가 사용 불가합니다. DART 동기화를 중단합니다.");
        return null;
    }

    // 사용량 초과 체크용 예시
    private boolean isKeyExhausted(String keyName) {
        // 이전에 해당 key 사용량 초과 기록이 있으면 true 반환
        return exhaustedKeys.contains(keyName);
    }

    @Transactional
    public void processDartCompanyBatch(List<Company> batch, int page, int totalPages,
            Map<String, Company> companyByCorpCode, Map<String, List<Company>> companiesByName) {

        log.info("DART 동기화 배치 처리 시작: 페이지 {}/{}, 처리할 회사 수: {}", page + 1, totalPages, batch.size());

        List<Company> companiesToUpdate = new ArrayList<>();
        List<Company> companiesToInsert = new ArrayList<>();

        String apiKey = getDartKey();
        if (apiKey == null) {
            log.error("No DART API key available for batch processing. Aborting.");
            return;
        }

        for (Company parsedCompany : batch) {
            String corpCode = parsedCompany.getCorpCode();
            String corpName = parsedCompany.getCompanyName();

            if (corpName == null || corpName.isEmpty() || corpCode == null || corpCode.isEmpty()) {
                log.warn("파싱된 데이터에 corpName 또는 corpCode가 비어있습니다. 건너뜁니다. corpName={}, corpCode={}", corpName,
                        corpCode);
                continue;
            }

            String ceo_name = null, business_number = null, address = null, website_url = null, corp_cls = null,
                    employee_count = null, reprt_code = "11011";
            int reportYear = LocalDate.now().getYear() - 1;
            boolean success = false;

            while (!success) {
                String companyApiUrl = "https://opendart.fss.or.kr/api/company.json?crtfc_key=" + apiKey
                        + "&corp_code=" + corpCode;
                try {
                    URL corpUrl = new URL(companyApiUrl);
                    HttpURLConnection conn = (HttpURLConnection) corpUrl.openConnection();
                    conn.setRequestMethod("GET");
                    conn.setConnectTimeout(120000);
                    conn.setReadTimeout(120000);

                    int responseCode2 = conn.getResponseCode();
                    if (responseCode2 == 200) {
                        try (BufferedReader br = new BufferedReader(
                                new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
                            String jsonText = br.lines().collect(java.util.stream.Collectors.joining());
                            JSONObject json = new JSONObject(jsonText);
                            String status = json.optString("status");

                            // 1. 한도 초과 시 다음 키로 전환
                            if ("020".equals(status)) {
                                log.warn(
                                        "⚠️ DART API request limit exceeded for current key. Switching to next key...");
                                currentDartKeyIndex++;
                                apiKey = getDartKey();
                                if (apiKey == null) {
                                    log.error("❌ All DART API keys have exceeded their limits. Aborting batch.");
                                    return;
                                }
                                continue; // 다음 키로 재시도
                            }

                            // 2. 정상 응답
                            else if ("000".equals(status)) {
                                success = true;
                                ceo_name = json.optString("ceo_nm");
                                business_number = json.optString("bizr_no");
                                address = json.optString("adres");
                                website_url = json.optString("hm_url");
                                corp_cls = json.optString("corp_cls");

                                // 상장회사면 종업원 수 API 추가 호출
                                if ("Y".equalsIgnoreCase(corp_cls) || "K".equalsIgnoreCase(corp_cls)
                                        || "N".equalsIgnoreCase(corp_cls)) {

                                    String outlineUrl = "https://opendart.fss.or.kr/api/fnlttMultiAcnt.json?crtfc_key="
                                            + apiKey + "&corp_code=" + corpCode + "&reprt_code=" + reprt_code
                                            + "&bsns_year=" + reportYear;

                                    try {
                                        URL outlineApi = new URL(outlineUrl);
                                        HttpURLConnection outlineConn = (HttpURLConnection) outlineApi.openConnection();
                                        outlineConn.setRequestMethod("GET");
                                        outlineConn.setConnectTimeout(60000);
                                        outlineConn.setReadTimeout(60000);

                                        int responseCode3 = outlineConn.getResponseCode();
                                        if (responseCode3 == 200) {
                                            try (BufferedReader br2 = new BufferedReader(
                                                    new InputStreamReader(outlineConn.getInputStream(), "UTF-8"))) {
                                                String jsonText2 = br2.lines()
                                                        .collect(java.util.stream.Collectors.joining());
                                                JSONObject json2 = new JSONObject(jsonText2);
                                                String status2 = json2.optString("status");

                                                if ("000".equals(status2)) {
                                                    String empCountStr = json2.optString("account_nm", null);
                                                    if (empCountStr != null && !empCountStr.isBlank()) {
                                                        try {
                                                            employee_count = empCountStr.replaceAll("[^0-9]", "");
                                                        } catch (NumberFormatException ignore) {
                                                            log.warn("종업원 수 파싱 실패: {}", empCountStr);
                                                        }
                                                    }
                                                } else if ("013".equals(status2)) {
                                                    log.warn("종업원 수 데이터 없음: corpCode={} ({})", corpCode, corpName);
                                                } else {
                                                    log.warn("종업원 수 API 호출 실패: corpCode={}, status={}, message={}",
                                                            corpCode, status2, json2.optString("message"));
                                                }
                                            }
                                        }
                                        outlineConn.disconnect();
                                    } catch (Exception e) {
                                        log.error("종업원 수 API 호출 중 예외 발생 (회사: {}, 코드: {})", corpName, corpCode, e);
                                    }
                                }
                            }

                            // 데이터 없음 (비상장 / 비제공)
                            else if ("013".equals(status)) {
                                log.warn("DART API에서 '{}'({}) 데이터 없음 (status=013)", corpName, corpCode);
                                success = true; // 실패로 간주하지 않음
                            }

                            // 그 외는 진짜 오류
                            else {
                                log.error("DART API 오류 (회사: {}, 코드: {}): status={}, message={}",
                                        corpName, corpCode, status, json.optString("message"));
                                success = true;
                            }
                        }
                    } else {
                        log.error("DART API company.json 호출 실패 (회사: {}, 코드: {}). 응답 코드: {}", corpName, corpCode,
                                responseCode2);
                        success = true;
                    }
                    conn.disconnect();

                } catch (Exception e) {
                    log.error("DART company.json API 호출 중 예외 발생 (회사: {}, 코드: {})", corpName, corpCode, e);
                    success = true;
                }
            }

            Company existingCompany = companyByCorpCode.get(corpCode);
            if (existingCompany != null) {
                boolean needsUpdate = !existingCompany.getCompanyName().equals(corpName)
                        || (ceo_name != null && !ceo_name.equals(existingCompany.getCeoName()))
                        || (business_number != null
                                && !business_number.equals(existingCompany.getBusinessNumber()))
                        || (address != null && !address.equals(existingCompany.getAddress()))
                        || (website_url != null && !website_url.equals(existingCompany.getWebsiteUrl()))
                        || (employee_count != null && !employee_count.equals(existingCompany.getEmployeeCount()));
                ;

                if (needsUpdate) {
                    existingCompany.setCompanyName(corpName);
                    if (ceo_name != null && !ceo_name.isBlank()) {
                        existingCompany.setCeoName(ceo_name);
                    }
                    if (business_number != null && !business_number.isBlank()) {
                        existingCompany.setBusinessNumber(business_number);
                    }
                    if (address != null && !address.isBlank()) {
                        existingCompany.setAddress(address);
                    }
                    if (website_url != null && !website_url.isBlank()) {
                        existingCompany.setWebsiteUrl(website_url);
                    }
                    if (employee_count != null && !employee_count.isBlank()) {
                        existingCompany.setEmployeeCount(employee_count);
                    }
                    companiesToUpdate.add(existingCompany);
                }
            } else {
                List<Company> matchingCompanies = companiesByName.get(corpName);
                if (matchingCompanies != null && !matchingCompanies.isEmpty()) {
                    Company companyToUpdate = matchingCompanies.remove(0);
                    companyToUpdate.setCorpCode(corpCode);
                    if (ceo_name != null && !ceo_name.isBlank()) {
                        companyToUpdate.setCeoName(ceo_name);
                    }
                    if (business_number != null && !business_number.isBlank()) {
                        companyToUpdate.setBusinessNumber(business_number);
                    }
                    if (address != null && !address.isBlank()) {
                        companyToUpdate.setAddress(address);
                    }
                    if (website_url != null && !website_url.isBlank()) {
                        companyToUpdate.setWebsiteUrl(website_url);
                    }
                    if (employee_count != null && !employee_count.isBlank()) {
                        companyToUpdate.setEmployeeCount(employee_count);
                    }
                    companiesToUpdate.add(companyToUpdate);
                } else {
                    Company newCompany = new Company();
                    newCompany.setCompanyName(corpName);
                    newCompany.setCorpCode(corpCode);
                    if (ceo_name != null && !ceo_name.isBlank()) {
                        newCompany.setCeoName(ceo_name);
                    }
                    if (business_number != null && !business_number.isBlank()) {
                        newCompany.setBusinessNumber(business_number);
                    }
                    if (address != null && !address.isBlank()) {
                        newCompany.setAddress(address);
                    }
                    if (website_url != null && !website_url.isBlank()) {
                        newCompany.setWebsiteUrl(website_url);
                    }
                    if (employee_count != null && !employee_count.isBlank()) {
                        newCompany.setEmployeeCount(employee_count);
                    }
                    companiesToInsert.add(newCompany);
                }
            }
        }

        if (!companiesToUpdate.isEmpty()) {
            log.info("[배치 {}/{}] 업데이트할 회사 수: {}", page + 1, totalPages, companiesToUpdate.size());
            try {
                companyRepository.saveAll(companiesToUpdate);
            } catch (Exception e) {
                log.error("배치 업데이트 중 DB 저장 오류: {}", e.getMessage(), e);
                // attempt individual saves to isolate bad records
                for (Company c : companiesToUpdate) {
                    try {
                        companyRepository.save(c);
                    } catch (Exception ex) {
                        log.error("개별 업데이트 실패 (회사: {}, 코드: {}): {}", c.getCompanyName(), c.getCorpCode(),
                                ex.getMessage());
                    }
                }
            }
        }

        if (!companiesToInsert.isEmpty()) {
            log.info("[배치 {}/{}] 추가할 회사 수: {}", page + 1, totalPages, companiesToInsert.size());
            try {
                companyRepository.saveAll(companiesToInsert);
            } catch (Exception e) {
                log.error("배치 삽입 중 DB 저장 오류: {}", e.getMessage(), e);
                for (Company c : companiesToInsert) {
                    try {
                        companyRepository.save(c);
                    } catch (Exception ex) {
                        log.error("개별 삽입 실패 (회사: {}, 코드: {}): {}", c.getCompanyName(), c.getCorpCode(),
                                ex.getMessage());
                    }
                }
            }
        }

        if (!companiesToUpdate.isEmpty() || !companiesToInsert.isEmpty()) {
            try {
                companyRepository.flush();
                log.info("[배치 {}/{}] DB 저장 완료.", page + 1, totalPages);
            } catch (Exception e) {
                log.error("flush 중 오류 발생: {}", e.getMessage(), e);
            }
        }
    }

    private String fetchXmlFromUrl(String urlString) throws Exception {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        StringBuilder response = new StringBuilder();
        try (BufferedReader in = new BufferedReader(
                new InputStreamReader(conn.getResponseCode() >= 400 ? conn.getErrorStream() : conn.getInputStream(),
                        StandardCharsets.UTF_8))) {
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
        }
        return response.toString();
    }

    private boolean downloadAndVerifyCorpCodeXml(String apiKey, File downloadedFile, File zipFile,
            File extractedXmlFile) {
        String urlString = "https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=" + apiKey;
        HttpURLConnection connection = null;

        try {
            log.info("DART corpCode.xml 다운로드 시작 (API 키: {})", apiKey);

            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                log.error("DART API 응답 실패. ResponseCode = {}", responseCode);
                return false;
            }

            // 기존 파일 삭제
            // if (downloadedFile.exists())
            // downloadedFile.delete();
            // if (zipFile.exists())
            // zipFile.delete();
            // if (extractedXmlFile.exists())
            // extractedXmlFile.delete();

            // 파일 다운로드
            try (BufferedInputStream in = new BufferedInputStream(connection.getInputStream());
                    FileOutputStream out = new FileOutputStream(downloadedFile)) {

                byte[] buffer = new byte[8192];
                int len;
                while ((len = in.read(buffer)) > 0) {
                    out.write(buffer, 0, len);
                }
            }

            // 확장자 변경 (exe → zip)
            if (!downloadedFile.renameTo(zipFile)) {
                log.error("파일 이름 변경 실패: {} → {}", downloadedFile.getName(), zipFile.getName());
                return false;
            }

            // 압축 해제
            try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
                ZipEntry entry;
                boolean xmlFound = false;
                while ((entry = zis.getNextEntry()) != null) {
                    if (entry.getName().endsWith(".xml")) {
                        try (FileOutputStream fos = new FileOutputStream(extractedXmlFile)) {
                            byte[] buffer = new byte[1024];
                            int len;
                            while ((len = zis.read(buffer)) > 0) {
                                fos.write(buffer, 0, len);
                            }
                        }
                        xmlFound = true;
                        break;
                    }
                }
                if (!xmlFound) {
                    log.error("ZIP 내부에 corpCode.xml이 존재하지 않습니다.");
                    return false;
                }
            }

            // 검증: XML 파일이 정상 생성되었는지 확인
            if (!extractedXmlFile.exists() || extractedXmlFile.length() == 0) {
                log.error("추출된 corpCode.xml이 존재하지 않거나 비어 있습니다.");
                return false;
            }

            log.info("corpCode.xml 다운로드 및 검증 성공 (API 키: {})", apiKey);
            return true;

        } catch (Exception e) {
            log.error("corpCode.xml 다운로드 중 오류 발생 (API 키: {}): {}", apiKey, e.getMessage(), e);
            return false;

        } finally {
            if (connection != null)
                connection.disconnect();
        }
    }

    @PostConstruct
    public void init() {
        currentDartKeyIndex = readKeyIndex(); // 파일에서 오늘 날짜와 함께 읽어서 초기화
    }

    private int readKeyIndex() {
        if (!keyStateFile.exists())
            return 1;
        try (BufferedReader reader = new BufferedReader(new FileReader(keyStateFile))) {
            String line = reader.readLine();
            if (line == null)
                return 1;
            String[] parts = line.split(",");
            String savedDate = parts[0];
            int savedIndex = Integer.parseInt(parts[1]);
            String today = LocalDate.now().toString();
            return today.equals(savedDate) ? savedIndex : 1;
        } catch (Exception e) {
            return 1;
        }
    }

    private void writeKeyIndex(int index) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(keyStateFile))) {
            String today = LocalDate.now().toString();
            writer.println(today + "," + index);
        } catch (IOException e) {
            log.warn("API Key 상태 저장 실패: {}", e.getMessage());
        }
    }

}
