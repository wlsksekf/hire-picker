package com.hirepicker.service;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

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
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmploymentDataService {

    private final Dotenv dotenv;
    private final CompanyRepository companyRepository;
    private final EmploymentDataProcessorService DataProcessorService;

    public EmploymentDataService(Dotenv dotenv, CompanyRepository companyRepository,
            EmploymentDataProcessorService dataProcessorService) {
        this.dotenv = dotenv;
        this.companyRepository = companyRepository;
        this.DataProcessorService = dataProcessorService;
    }

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

    @Scheduled(cron = "0 0 6 * * MON")
    @Transactional
    public void scheduledSyncCompanies() {
        synchronizeCompanies();
        SyncDartInfo();
    }

    // Dart API 가져와서 DB에 저장
    @Transactional
    public void SyncDartInfo() {
        try {

            String apiKey = getDartKey();
            String urlString = "https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=" + apiKey;

            File downloadedFile = new File("downloaded_dart_data.exe");
            File zipFile = new File("downloaded_dart_data.zip");
            File extractedXmlFile = new File("corpCode.xml");

            HttpURLConnection connection = null;

            try {
                URL url = new URL(urlString);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");

                int responseCode = connection.getResponseCode();

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // exe 파일 다운로드
                    try (BufferedInputStream in = new BufferedInputStream(connection.getInputStream());
                            FileOutputStream out = new FileOutputStream(downloadedFile)) {
                        byte[] buffer = new byte[5000];
                        int len;
                        while ((len = in.read(buffer)) > 0) {
                            out.write(buffer, 0, len);
                        }
                    }

                    // 확장자 변경 exe → zip
                    if (!downloadedFile.renameTo(zipFile)) {
                        throw new RuntimeException("❌ Failed to rename downloaded file to .zip");
                    }

                    // 압축 해제
                    try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
                        ZipEntry entry;
                        while ((entry = zis.getNextEntry()) != null) {
                            if (entry.getName().endsWith(".xml")) {
                                try (FileOutputStream fos = new FileOutputStream(extractedXmlFile)) {
                                    byte[] buffer = new byte[1024];
                                    int len;
                                    while ((len = zis.read(buffer)) > 0) {
                                        fos.write(buffer, 0, len);
                                    }
                                }
                                break;
                            }
                        }
                    }

                    if (!extractedXmlFile.exists()) {
                        throw new RuntimeException("❌ XML file not found in the downloaded zip");
                    }

                    log.info("DART 동기화 시작...");
                    // XML 파싱 (SAX)
                    SAXParserFactory saxFactory = SAXParserFactory.newInstance();
                    SAXParser saxParser = saxFactory.newSAXParser();
                    DartCorpCodeSaxHandler handler = new DartCorpCodeSaxHandler();
                    saxParser.parse(extractedXmlFile, handler);
                    List<Company> parsedCompanies = handler.getCompanies();
                    log.info("파싱된 회사 수: {}", parsedCompanies.size());

                    // DB 데이터를 corpCode와 companyName 기준으로 미리 로드
                    List<Company> allCompanies = companyRepository.findAll();
                    log.info("DB에 있는 총 회사 수: {}", allCompanies.size());
                    Map<String, Company> companyByCorpCode = allCompanies.stream()
                            .filter(c -> c.getCorpCode() != null)
                            .collect(Collectors.toMap(Company::getCorpCode, c -> c, (c1, c2) -> {
                                log.warn("DB에 중복된 corpCode 발견: {}. '{}'와 '{}' 중 첫 번째 회사 '{}'를 사용합니다.", c1.getCorpCode(),
                                        c1.getCompanyName(), c2.getCompanyName(), c1.getCompanyName());
                                return c1;
                            }));
                    log.info("DB에 있는 corpCode 기준 회사 수: {}", companyByCorpCode.size());

                    Map<String, List<Company>> companiesByName = allCompanies.stream()
                            .filter(c -> c.getCorpCode() == null)
                            .collect(Collectors.groupingBy(Company::getCompanyName));
                    log.info("DB에 corpCode가 없는 회사 이름 기준 그룹 수: {}", companiesByName.size());

                    List<Company> companiesToUpdate = new ArrayList<>();
                    List<Company> companiesToInsert = new ArrayList<>();

                    for (Company parsedCompany : parsedCompanies) {
                        String corpCode = parsedCompany.getCorpCode();
                        String corpName = parsedCompany.getCompanyName();

                        if (corpName == null || corpName.isEmpty() || corpCode == null || corpCode.isEmpty()) {
                            String apiurl = "https://opendart.fss.or.kr/api/list.json?crtfc_key=" + apiKey
                                    + "&corp_code=" + corpCode;
                            // api 호출하자 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                            log.warn(
                                    "파싱된 데이터에 corpName 또는 corpCode가 비어있어 건너<binary data, 1 bytes>니다: corpName={}, corpCode={}",
                                    corpName, corpCode);
                            continue;
                        }

                        log.debug("처리 중인 회사: {}, {}", corpName, corpCode);

                        Company existingCompanyByCorpCode = companyByCorpCode.get(corpCode);
                        if (existingCompanyByCorpCode != null) {
                            log.debug("DB에서 corpCode '{}'를 찾았습니다: '{}'", corpCode,
                                    existingCompanyByCorpCode.getCompanyName());
                            // corpCode가 이미 존재함. 이름이 다르면 업데이트
                            if (!existingCompanyByCorpCode.getCompanyName().equals(corpName)) {
                                log.info("corpCode '{}'의 회사 이름이 변경되었습니다. DB: '{}' -> DART: '{}'. 업데이트합니다.", corpCode,
                                        existingCompanyByCorpCode.getCompanyName(), corpName);
                                existingCompanyByCorpCode.setCompanyName(corpName);

                                companiesToUpdate.add(existingCompanyByCorpCode);
                            } else {
                                log.debug("corpCode '{}'의 회사 이름이 DB와 DART 모두 '{}'(으)로 동일합니다. 변경사항 없음.", corpCode,
                                        corpName);
                            }
                        } else {
                            log.debug("DB에 corpCode '{}'가 없습니다. 새로운 코드로 처리합니다.", corpCode);
                            // 새로운 corpCode. 같은 이름의 회사가 있는지 확인 (corpCode가 없는)
                            List<Company> matchingCompanies = companiesByName.get(corpName);
                            if (matchingCompanies != null && !matchingCompanies.isEmpty()) {
                                // 찾은 회사 중 첫 번째 회사의 corpCode를 업데이트
                                Company companyToUpdate = matchingCompanies.get(0);
                                log.info("DB에 이름은 같지만 corpCode가 없는 회사 '{}'를 찾았습니다. corpCode '{}'를 설정합니다.", corpName,
                                        corpCode);
                                companyToUpdate.setCorpCode(corpCode);
                                companiesToUpdate.add(companyToUpdate);
                                // 맵에서 제거하여 중복 업데이트 방지
                                matchingCompanies.remove(0);
                            } else {
                                // 새로운 회사로 추가
                                log.info("DB에 '{}'에 해당하는 회사가 없습니다. 새 회사로 추가합니다. (corpCode: {})", corpName, corpCode);
                                Company newCompany = new Company();
                                newCompany.setCompanyName(corpName);
                                newCompany.setCorpCode(corpCode);
                                companiesToInsert.add(newCompany);
                            }
                        }
                    }

                    log.info("업데이트할 회사 수: {}", companiesToUpdate.size());
                    log.info("추가할 회사 수: {}", companiesToInsert.size());

                    if (!companiesToUpdate.isEmpty()) {
                        log.info("회사 정보 업데이트를 시작합니다...");
                        companyRepository.saveAll(companiesToUpdate);
                        log.info("회사 정보 업데이트 완료.");
                    }

                    if (!companiesToInsert.isEmpty()) {
                        log.info("새 회사 정보 추가를 시작합니다...");
                        int batchSize = 1000;
                        for (int i = 0; i < companiesToInsert.size(); i += batchSize) {
                            int end = Math.min(i + batchSize, companiesToInsert.size());
                            List<Company> batch = companiesToInsert.subList(i, end);
                            log.info("  - {}/{} : {}개 회사 추가 중...", (i / batchSize) + 1,
                                    (companiesToInsert.size() / batchSize) + 1, batch.size());
                            companyRepository.saveAll(batch);
                            companyRepository.flush(); // 각 배치 후 flush하여 메모리 관리
                        }
                        log.info("새 회사 정보 추가 완료.");
                    }

                    companyRepository.flush();
                    log.info("DART 동기화 완료.");

                } else {
                    throw new RuntimeException("❌ DART API 요청 실패, ResponseCode=" + responseCode);
                }
            } catch (Exception e) {
                log.error("❌ DART 동기화 중 오류 발생: {}", e.getMessage(), e);
                throw new RuntimeException(e);
            } finally {
                if (connection != null)
                    connection.disconnect();
            }
        } catch (Exception e) {
            log.error("Error occurred during DART info synchronization", e);
        }

    }

    @Transactional
    public void synchronizePublicJobs() {
        String apiKey = getWork24Key();
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
        String apiKey = getWork24Key();
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
        String apiKey = getWork24Key();
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
        String apiKey = dotenv.get("work24_key");
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("CRITICAL: 'work24_key' not found in .env file.");
            return null;
        }
        return apiKey;
    }

    private String getDartKey() {
        String apiKey = dotenv.get("dart_key");
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("CRITICAL: 'dart_key' not found in .env file.");
            log.error("CRITICAL: 'dart_key' not found in .env file.");
            return null;
        }
        log.info("Using DART API Key: {}", apiKey);
        return apiKey;
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

}
