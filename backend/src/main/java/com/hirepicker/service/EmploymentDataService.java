package com.hirepicker.service;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.io.BufferedInputStream;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;


import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.entity.Company;
import com.hirepicker.repository.CompanyRepository;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;

import com.hirepicker.util.XmlParser;
import com.hirepicker.util.DataMapper;


@Slf4j
@Service
@RequiredArgsConstructor
public class EmploymentDataService {

    private final Dotenv dotenv;
    private final CompanyRepository companyRepository;

    private final EmploymentDataProcessorService DataProcessorService;

    @Scheduled(cron = "0 0 4 * * *") @Transactional
    public void scheduledSyncJobs() { synchronizePublicJobs(); }

    @Scheduled(cron = "0 0 5 * * *") @Transactional
    public void scheduledSyncEvents() { synchronizeEvents(); }

    @Scheduled(cron = "0 0 6 * * MON") @Transactional
    public void scheduledSyncCompanies() { synchronizeCompanies(); }

    // @Scheduled(cron = "0 0 6 * * MON")
    // public void scheduledSyncDartInfo() {
    //     try {
    //         synchronizeDartInfo();
    //     } catch (Exception e) {
    //         log.error("Error occurred during DART info synchronization", e);
    //     }
    // }

    @Transactional
    public void synchronizePublicJobs() {
        String apiKey = getWork24Key();
        if (apiKey == null) return;
        log.info("Executing: Job Synchronization");
        List<JobDto> allJobs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) { // 100개씩 5페이지, 총 500개 시도
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L21.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("work24 API Error (Jobs): {}", XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
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
                if (pageOfJobs.isEmpty()) break;
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
        if (apiKey == null) return;
        log.info("Executing: Event Synchronization");
        List<EventDto> allEvents = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L11.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("work24 API Error (Events): {}", XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
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
                if (pageOfEvents.isEmpty()) break;
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
        if (apiKey == null) return;
        log.info("Executing: Company Synchronization");
        List<CompanyDto> allCompanies = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L31.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("work24 API Error (Companies): {}", XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
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
                if (pageOfCompanies.isEmpty()) break;
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



    @Transactional
    public void synchronizeDartInfo() throws Exception {
    log.info("✅ DART 동기화 시작");

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
            log.info("DART API HTTP Response Code: {}", responseCode);

            if (responseCode == HttpURLConnection.HTTP_OK) {
                // exe 파일 다운로드
                try (BufferedInputStream in = new BufferedInputStream(connection.getInputStream());
                     FileOutputStream out = new FileOutputStream(downloadedFile)) {
                    byte[] buffer = new byte[1024];
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

                // XML 파싱
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document doc = builder.parse(extractedXmlFile);
                NodeList list = doc.getElementsByTagName("list");

                // DB 데이터 미리 로드
                Map<String, Company> companyMap = companyRepository.findAll().stream()
                        .collect(Collectors.toMap(Company::getCompanyName, Function.identity(), (existing, replacement) -> existing));

                Set<String> existingCorpCodes = companyMap.values().stream()
                        .map(Company::getCorpCode)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

                List<Company> companiesToUpdate = new ArrayList<>();
                Map<String, Company> newCompaniesMap = new HashMap<>();

                for (int i = 0; i < list.getLength(); i++) {
                    Element elem = (Element) list.item(i);
                    String corpCode = elem.getElementsByTagName("corp_code").item(0).getTextContent().trim();
                    String corpName = elem.getElementsByTagName("corp_name").item(0).getTextContent().trim();

                    if (corpName.isEmpty() || corpCode.isEmpty()) continue;

                    Company existingCompany = companyMap.get(corpName);

                    if (existingCompany != null) {
                        String oldCorpCode = existingCompany.getCorpCode();
                        if (oldCorpCode == null || !oldCorpCode.equals(corpCode)) {
                            if (existingCorpCodes.contains(corpCode)) {
                                log.warn("Could not update corp_code for company '{}' to '{}' because it is already in use.", corpName, corpCode);
                            } else {
                                existingCompany.setCorpCode(corpCode);
                                companiesToUpdate.add(existingCompany);
                                if (oldCorpCode != null) {
                                    existingCorpCodes.remove(oldCorpCode);
                                }
                                existingCorpCodes.add(corpCode);
                            }
                        }
                    } else {
                        if (existingCorpCodes.contains(corpCode)) {
                            log.warn("Could not insert new company '{}' with corp_code '{}' because the code is already in use.", corpName, corpCode);
                        } else {
                            Company newCompany = new Company();
                            newCompany.setCompanyName(corpName);
                            newCompany.setCorpCode(corpCode);
                            newCompaniesMap.put(corpName, newCompany);
                            existingCorpCodes.add(corpCode);
                        }
                    }
                }

                List<Company> companiesToInsert = new ArrayList<>(newCompaniesMap.values());

                if (!companiesToUpdate.isEmpty()) companyRepository.saveAll(companiesToUpdate);
                if (!companiesToInsert.isEmpty()) companyRepository.saveAll(companiesToInsert);

                log.info("✅ DART 동기화 완료 - 기존 업데이트: {}, 신규 추가: {}",
                        companiesToUpdate.size(), companiesToInsert.size());
            } else {
                throw new RuntimeException("❌ DART API 요청 실패, ResponseCode=" + responseCode);
            }

        } catch (Exception e) {
            log.error("❌ DART 동기화 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        } finally {
            if (connection != null) connection.disconnect();
        }
    }



    private String getWork24Key() {
        String apiKey = dotenv.get("work24_key");
        if (apiKey == null || apiKey.isBlank()) { System.err.println("CRITICAL: 'work24_key' not found in .env file."); return null; }
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
        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getResponseCode() >= 400 ? conn.getErrorStream() : conn.getInputStream(), StandardCharsets.UTF_8))) {
            String inputLine;
            while ((inputLine = in.readLine()) != null) { response.append(inputLine); }
        }
        return response.toString();
    }






}
