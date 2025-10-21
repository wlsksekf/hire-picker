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

@Slf4j // 로깅을 위한 어노테이션
@Service // Spring의 서비스 빈으로 등록
@RequiredArgsConstructor // final 필드에 대한 생성자 자동 생성
public class Work24ApiService {

    private final Dotenv dotenv; // .env 파일 로드용


    private final Work24DataProcessorService work24DataProcessorService; // 데이터 처리 서비스

    // 매일 새벽 4시에 채용 공고 동기화 실행
    @Scheduled(cron = "0 0 4 * * *") @Transactional
    public void scheduledSyncJobs() { synchronizePublicJobs(); }

    // 매일 새벽 5시에 채용 행사 동기화 실행
    @Scheduled(cron = "0 0 5 * * *") @Transactional
    public void scheduledSyncEvents() { synchronizeEvents(); }

    // 매주 월요일 새벽 6시에 기업 정보 동기화 실행
    @Scheduled(cron = "0 0 6 * * MON") @Transactional
    public void scheduledSyncCompanies() { synchronizeCompanies(); }

    // Work24 API를 통해 채용 공고를 동기화하는 메서드
    @Transactional
    public void synchronizePublicJobs() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        log.info("채용 공고 동기화 시작");
        List<JobDto> allJobs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) { // 100개씩 5페이지, 총 500개 시도
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L21.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("Work24 API 오류 (채용 공고): {}", Work24XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
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
                log.error("Work24 API에서 채용 공고를 가져오거나 파싱하는 데 실패했습니다. 페이지: {}", i, e);
                break; // 오류 발생 시 중단
            }
        }

        for (JobDto dto : allJobs) {
            work24DataProcessorService.processJobDto(dto);
        }
        log.info("채용 공고 동기화 완료. 총 처리된 항목 수: {}", allJobs.size());
    }

    // Work24 API를 통해 채용 행사를 동기화하는 메서드
    @Transactional
    public void synchronizeEvents() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        log.info("채용 행사 동기화 시작");
        List<EventDto> allEvents = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L11.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("Work24 API 오류 (채용 행사): {}", Work24XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
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
                log.error("Work24 API에서 채용 행사를 가져오거나 파싱하는 데 실패했습니다. 페이지: {}", i, e);
                break; // 오류 발생 시 중단
            }
        }

        for (EventDto dto : allEvents) {
            work24DataProcessorService.processEventDto(dto);
        }
        log.info("채용 행사 동기화 완료. 총 처리된 항목 수: {}", allEvents.size());
    }

    // Work24 API를 통해 기업 정보를 동기화하는 메서드
    @Transactional
    public void synchronizeCompanies() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        log.info("기업 정보 동기화 시작");
        List<CompanyDto> allCompanies = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            try {
                String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L31.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + i + "&display=100";
                String xml = fetchXmlFromUrl(url);
                if (xml.contains("<error>")) { log.error("Work24 API 오류 (기업 정보): {}", Work24XmlParser.getTagValueFromRawXml(xml, "error")); continue; }
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
                log.error("Work24 API에서 기업 정보를 가져오거나 파싱하는 데 실패했습니다. 페이지: {}", i, e);
                break; // 오류 발생 시 중단
            }
        }

        for (CompanyDto dto : allCompanies) {
            work24DataProcessorService.processCompanyDto(dto);
        }
        log.info("기업 정보 동기화 완료. 총 처리된 항목 수: {}", allCompanies.size());
    }

    // .env 파일에서 API 키를 가져오는 메서드
    private String getApiKey() {
        String apiKey = dotenv.get("work24_key");
        if (apiKey == null || apiKey.isBlank()) { System.err.println("CRITICAL: .env 파일에서 'work24_key'를 찾을 수 없습니다."); return null; }
        return apiKey;
    }

    // URL에서 XML 데이터를 가져오는 메서드
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