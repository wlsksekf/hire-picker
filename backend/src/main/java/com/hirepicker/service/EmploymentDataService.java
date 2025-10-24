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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.json.JSONObject;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmploymentDataService {

    private final Dotenv dotenv;
    private final CompanyRepository companyRepository;
    private final EmploymentDataProcessorService DataProcessorService;

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
    public void SyncDartInfo() {

        String apiKey = getDartKey();
        if (apiKey == null) {
            log.error("DART API 키가 없어 동기화를 중단합니다.");
            return;
        }
        String urlString = "https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=" + apiKey;

        File buildDir = new File("build");
        if (!buildDir.exists()) {
            buildDir.mkdirs();
        }
        File downloadedFile = new File(buildDir, "downloaded_dart_data.exe");
        File zipFile = new File(buildDir, "downloaded_dart_data.zip");
        File extractedXmlFile = new File(buildDir, "corpCode.xml");
        File progressFile = new File(buildDir, "dart_sync_progress.txt"); // 진행상황 저장 파일

        HttpURLConnection connection = null;

        try {
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (BufferedInputStream in = new BufferedInputStream(connection.getInputStream());
                        FileOutputStream out = new FileOutputStream(downloadedFile)) {
                    byte[] buffer = new byte[8192];
                    int len;
                    while ((len = in.read(buffer)) > 0) {
                        out.write(buffer, 0, len);
                    }
                }

                if (!downloadedFile.renameTo(zipFile)) {
                    throw new RuntimeException("❌ Failed to rename downloaded file to .zip");
                }

                try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
                    ZipEntry entry;
                    if ((entry = zis.getNextEntry()) != null && entry.getName().endsWith(".xml")) {
                        try (FileOutputStream fos = new FileOutputStream(extractedXmlFile)) {
                            byte[] buffer = new byte[1024];
                            int len;
                            while ((len = zis.read(buffer)) > 0) {
                                fos.write(buffer, 0, len);
                            }
                        }
                    }
                }

                if (!extractedXmlFile.exists()) {
                    throw new RuntimeException("❌ XML file not found in the downloaded zip");
                }

                log.info("DART 전체 기업 목록 파싱 시작...");
                SAXParserFactory saxFactory = SAXParserFactory.newInstance();
                SAXParser saxParser = saxFactory.newSAXParser();
                DartCorpCodeSaxHandler handler = new DartCorpCodeSaxHandler();
                saxParser.parse(extractedXmlFile, handler);
                List<Company> allParsedCompanies = handler.getCompanies();
                log.info("파싱된 전체 회사 수: {}", allParsedCompanies.size());

                List<Company> allDbCompanies = companyRepository.findAll();
                log.info("DB에 있는 총 회사 수: {}", allDbCompanies.size());

                Map<String, Company> companyByCorpCode = new HashMap<>();
                for (Company company : allDbCompanies) {
                    String currentCorpCode = company.getCorpCode();
                    if (currentCorpCode != null && !currentCorpCode.isEmpty()) {
                        if (!companyByCorpCode.containsKey(currentCorpCode)) {
                            companyByCorpCode.put(currentCorpCode, company);
                        } else {
                            log.warn("DB에 중복된 corpCode 발견: {}. 기존 회사 '{}' 유지.", currentCorpCode,
                                    companyByCorpCode.get(currentCorpCode).getCompanyName());
                        }
                    }
                }
                log.info("DB에 있는 corpCode 기준 회사 수: {}", companyByCorpCode.size());

                Map<String, List<Company>> companiesByName = new HashMap<>();
                for (Company company : allDbCompanies) {
                    if (company.getCorpCode() == null || company.getCorpCode().isEmpty()) {
                        companiesByName.computeIfAbsent(company.getCompanyName(), k -> new ArrayList<>()).add(company);
                    }
                }
                log.info("DB에 corpCode가 없는 회사 이름 기준 그룹 수: {}", companiesByName.size());

                int batchSize = 100;
                int totalPages = (int) Math.ceil((double) allParsedCompanies.size() / batchSize);
                int startPage = 0;
                if (progressFile.exists()) {
                    try (java.io.BufferedReader reader = new java.io.BufferedReader(
                            new java.io.FileReader(progressFile))) {
                        String line = reader.readLine();
                        if (line != null && !line.trim().isEmpty()) {
                            startPage = Integer.parseInt(line.trim());
                            log.info("DART 동기화 진행상황 파일 발견. 페이지 {}부터 이어갑니다.", startPage);
                        }
                    } catch (java.io.IOException | NumberFormatException e) {
                        log.warn("진행상황 파일을 읽는 중 오류가 발생했습니다. 처음부터 시작합니다.", e);
                    }
                }

                for (int page = startPage; page < totalPages; page++) {
                    try (java.io.PrintWriter writer = new java.io.PrintWriter(progressFile)) {
                        writer.print(page);
                    } catch (java.io.FileNotFoundException e) {
                        log.error("진행상황 파일 쓰기 오류. 페이지: {}", page, e);
                    }

                    int start = page * batchSize;
                    int end = Math.min(start + batchSize, allParsedCompanies.size());
                    List<Company> batch = allParsedCompanies.subList(start, end);

                    processDartCompanyBatch(batch, apiKey, page, totalPages, companyByCorpCode, companiesByName);
                }

                log.info("DART 전체 동기화 완료.");

                if (progressFile.exists()) {
                    progressFile.delete();
                }
                ;

            } else {
                throw new RuntimeException("❌ DART API corpCode.xml 요청 실패, ResponseCode=" + responseCode);
            }
        } catch (Exception e) {
            log.error("❌ DART 동기화 중 심각한 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
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
        String apiKey = dotenv.get("dart_key1");
        if (apiKey == null || apiKey.isBlank()) {
            log.error("CRITICAL: 'dart_key1' not found in .env file.");
            apiKey = dotenv.get("dart_key2");
            if (apiKey == null || apiKey.isBlank()) {
                log.error("CRITICAL: 'dart_key2' not found in .env file.");
                apiKey = dotenv.get("dart_key3");
                if (apiKey == null || apiKey.isBlank()) {
                    log.error("CRITICAL: 'dart_key3' not found in .env file.");
                    apiKey = dotenv.get("dart_key4");
                    if (apiKey == null || apiKey.isBlank()) {
                        log.error("CRITICAL: 'dart_key4' not found in .env file.");
                        apiKey = dotenv.get("dart_key5");
                        if (apiKey == null || apiKey.isBlank()) {
                            log.error("CRITICAL: 'dart_key5' not found in .env file.");
                            return null;
                        }
                    }
                }
            }
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

    @Transactional
    public void processDartCompanyBatch(List<Company> batch, String apiKey, int page, int totalPages,
            Map<String, Company> companyByCorpCode, Map<String, List<Company>> companiesByName) {

        log.info("DART 동기화 배치 처리 시작: 페이지 {}/{}, 처리할 회사 수: {}", page + 1, totalPages, batch.size());

        List<Company> companiesToUpdate = new ArrayList<>();
        List<Company> companiesToInsert = new ArrayList<>();

        for (Company parsedCompany : batch) {
            String corpCode = parsedCompany.getCorpCode();
            String corpName = parsedCompany.getCompanyName();

            if (corpName == null || corpName.isEmpty() || corpCode == null || corpCode.isEmpty()) {
                log.warn("파싱된 데이터에 corpName 또는 corpCode가 비어있습니다. 건너뜁니다. corpName={}, corpCode={}", corpName,
                        corpCode);
                continue;
            }

            String ceo_name = null, business_number = null, address = null, website_url = null;
            String companyApiUrl = "https://opendart.fss.or.kr/api/company.json?crtfc_key=" + apiKey
                    + "&corp_code=" + corpCode;
            try {
                URL corpUrl = new URL(companyApiUrl);
                HttpURLConnection conn = (HttpURLConnection) corpUrl.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(60000);
                conn.setReadTimeout(60000);

                int responseCode2 = conn.getResponseCode();
                if (responseCode2 == 200) {
                    try (BufferedReader br = new BufferedReader(
                            new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
                        String jsonText = br.lines().collect(java.util.stream.Collectors.joining());
                        JSONObject json = new JSONObject(jsonText);
                        String status = json.optString("status");
                        if ("000".equals(status)) {
                            ceo_name = json.optString("ceo_nm");
                            business_number = json.optString("bizr_no");
                            address = json.optString("adres");
                            website_url = json.optString("hm_url");
                        } else if ("013".equals(status)) {
                            log.warn("DART API에서 '{}'({})에 대한 데이터를 찾을 수 없습니다. (상태: {})", corpName, corpCode,
                                    status);
                        } else {
                            log.error("DART API 오류 (회사: {}, 코드: {}): status={}, message={}", corpName,
                                    corpCode, status, json.optString("message"));
                        }
                    }
                } else {
                    log.error("DART API company.json 호출 실패 (회사: {}, 코드: {}). 응답 코드: {}", corpName, corpCode,
                            responseCode2);
                }
                conn.disconnect();
            } catch (Exception e) {
                log.error("DART company.json API 호출 중 예외 발생 (회사: {}, 코드: {})", corpName, corpCode, e);
            }

            Company existingCompany = companyByCorpCode.get(corpCode);
            if (existingCompany != null) {
                boolean needsUpdate = !existingCompany.getCompanyName().equals(corpName)
                        || (ceo_name != null && !ceo_name.equals(existingCompany.getCeoName()))
                        || (business_number != null
                                && !business_number.equals(existingCompany.getBusinessNumber()))
                        || (address != null && !address.equals(existingCompany.getAddress()))
                        || (website_url != null && !website_url.equals(existingCompany.getWebsiteUrl()));

                if (needsUpdate) {
                    existingCompany.setCompanyName(corpName);
                    existingCompany.setCeoName(ceo_name);
                    existingCompany.setBusinessNumber(business_number);
                    existingCompany.setAddress(address);
                    existingCompany.setWebsiteUrl(website_url);
                    companiesToUpdate.add(existingCompany);
                }
            } else {
                List<Company> matchingCompanies = companiesByName.get(corpName);
                if (matchingCompanies != null && !matchingCompanies.isEmpty()) {
                    Company companyToUpdate = matchingCompanies.remove(0);
                    companyToUpdate.setCorpCode(corpCode);
                    companyToUpdate.setCeoName(ceo_name);
                    companyToUpdate.setBusinessNumber(business_number);
                    companyToUpdate.setAddress(address);
                    companyToUpdate.setWebsiteUrl(website_url);
                    companiesToUpdate.add(companyToUpdate);
                } else {
                    Company newCompany = new Company();
                    newCompany.setCompanyName(corpName);
                    newCompany.setCorpCode(corpCode);
                    newCompany.setCeoName(ceo_name);
                    newCompany.setBusinessNumber(business_number);
                    newCompany.setAddress(address);
                    newCompany.setWebsiteUrl(website_url);
                    companiesToInsert.add(newCompany);
                }
            }
        }

        if (!companiesToUpdate.isEmpty()) {
            log.info("[배치 {}/{}] 업데이트할 회사 수: {}", page + 1, totalPages, companiesToUpdate.size());
            companyRepository.saveAll(companiesToUpdate);
        }

        if (!companiesToInsert.isEmpty()) {
            log.info("[배치 {}/{}] 추가할 회사 수: {}", page + 1, totalPages, companiesToInsert.size());
            companyRepository.saveAll(companiesToInsert);
        }

        if (!companiesToUpdate.isEmpty() || !companiesToInsert.isEmpty()) {
            companyRepository.flush();
            log.info("[배치 {}/{}] DB 저장 완료.", page + 1, totalPages);
        }
    }

}
