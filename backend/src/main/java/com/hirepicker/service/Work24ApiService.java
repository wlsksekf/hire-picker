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
import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;

import com.hirepicker.util.Work24XmlParser;
import com.hirepicker.util.Work24DataMapper;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

@Slf4j
@Service
@RequiredArgsConstructor
public class Work24ApiService {

    private final Dotenv dotenv;


    private final Work24DataProcessorService work24DataProcessorService;

    @Scheduled(cron = "0 0 4 * * *") @Transactional
    public void scheduledSyncJobs() { synchronizePublicJobs(); }

    @Scheduled(cron = "0 0 5 * * *") @Transactional
    public void scheduledSyncEvents() { synchronizeEvents(); }

    @Scheduled(cron = "0 0 6 * * MON") @Transactional
    public void scheduledSyncCompanies() { synchronizeCompanies(); }

    @Transactional
    public void synchronizePublicJobs() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        log.info("Executing: Job Synchronization");
        List<JobDto> allJobs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) { // 100개씩 5페이지, 총 500개 시도
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L21.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("work24 API Error (Jobs): {}", Work24XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
                Document doc = Work24XmlParser.parseXml(xml);
                NodeList nodeList = doc.getElementsByTagName("dhsOpenEmpInfo");
                List<JobDto> pageOfJobs = new ArrayList<>();
                for (int j = 0; j < nodeList.getLength(); j++) {
                    Element e = (Element) nodeList.item(j);
                    JobDto dto = Work24DataMapper.mapToJobDto(e);
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
            work24DataProcessorService.processJobDto(dto);
        }
        log.info("Finished: Job Synchronization. Total items processed: {}", allJobs.size());
    }

    @Transactional
    public void synchronizeEvents() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        log.info("Executing: Event Synchronization");
        List<EventDto> allEvents = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L11.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("work24 API Error (Events): {}", Work24XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
                Document doc = Work24XmlParser.parseXml(xml);
                NodeList nodeList = doc.getElementsByTagName("empEvent");
                List<EventDto> pageOfEvents = new ArrayList<>();
                for (int j = 0; j < nodeList.getLength(); j++) {
                    Element e = (Element) nodeList.item(j);
                    EventDto dto = Work24DataMapper.mapToEventDto(e);
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
            work24DataProcessorService.processEventDto(dto);
        }
        log.info("Finished: Event Synchronization. Total items processed: {}", allEvents.size());
    }

    @Transactional
    public void synchronizeCompanies() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        log.info("Executing: Company Synchronization");
        List<CompanyDto> allCompanies = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L31.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("work24 API Error (Companies): {}", Work24XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
                Document doc = Work24XmlParser.parseXml(xml);
                NodeList nodeList = doc.getElementsByTagName("dhsOpenEmpHireInfo");
                List<CompanyDto> pageOfCompanies = new ArrayList<>();
                for (int j = 0; j < nodeList.getLength(); j++) {
                    Element e = (Element) nodeList.item(j);
                    CompanyDto dto = Work24DataMapper.mapToCompanyDto(e);
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
            work24DataProcessorService.processCompanyDto(dto);
        }
        log.info("Finished: Company Synchronization. Total items processed: {}", allCompanies.size());
    }

    private String getApiKey() {
        String apiKey = dotenv.get("work24_key");
        if (apiKey == null || apiKey.isBlank()) { System.err.println("CRITICAL: 'work24_key' not found in .env file."); return null; }
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
