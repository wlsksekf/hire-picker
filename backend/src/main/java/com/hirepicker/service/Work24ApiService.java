package com.hirepicker.service;

import com.hirepicker.dto.CompanyDto;
import com.hirepicker.dto.EventDto;
import com.hirepicker.dto.JobDto;
import com.hirepicker.model.Company;
import com.hirepicker.model.EmpEvent;
import com.hirepicker.model.JobPosting;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.EmpEventRepository;
import com.hirepicker.repository.JobPostingRepository;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class Work24ApiService {

    private final CompanyRepository companyRepository;
    private final JobPostingRepository jobPostingRepository;
    private final EmpEventRepository empEventRepository;
    private final Dotenv dotenv;

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
        System.out.println("Executing: Job Synchronization");
        List<JobDto> allJobs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) { // 100개씩 5페이지, 총 500개 시도
            List<JobDto> pageOfJobs = getJobs(apiKey, i);
            if (pageOfJobs.isEmpty()) break;
            allJobs.addAll(pageOfJobs);
        }

        for (JobDto dto : allJobs) {
            Company company = companyRepository.findByCompanyName(dto.companyName())
                    .orElseGet(() -> companyRepository.save(Company.builder().companyName(dto.companyName()).build()));

            jobPostingRepository.findByPostingId(dto.id()).ifPresentOrElse(
                p -> {
                    p.setTitle(dto.title());
                    p.setEmploymentType(dto.employmentType());
                    p.setLocation(dto.location());
                    jobPostingRepository.save(p);
                },
                () -> jobPostingRepository.save(JobPosting.builder().postingId(dto.id()).company(company).title(dto.title()).employmentType(dto.employmentType()).location(dto.location()).build())
            );
        }
        System.out.println("Finished: Job Synchronization. Total items processed: " + allJobs.size());
    }

    @Transactional
    public void synchronizeEvents() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        System.out.println("Executing: Event Synchronization");
        List<EventDto> allEvents = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            List<EventDto> pageOfEvents = getEvents(apiKey, i);
            if (pageOfEvents.isEmpty()) break;
            allEvents.addAll(pageOfEvents);
        }

        for (EventDto dto : allEvents) {
            empEventRepository.findByEventCode(dto.id()).ifPresentOrElse(
                e -> { e.setEventName(dto.title()); e.setEventDuration(dto.period()); e.setArea(dto.location()); empEventRepository.save(e); },
                () -> empEventRepository.save(EmpEvent.builder().eventCode(dto.id()).eventName(dto.title()).eventDuration(dto.period()).area(dto.location()).build())
            );
        }
        System.out.println("Finished: Event Synchronization. Total items processed: " + allEvents.size());
    }

    @Transactional
    public void synchronizeCompanies() {
        String apiKey = getApiKey();
        if (apiKey == null) return;
        System.out.println("Executing: Company Synchronization");
        List<CompanyDto> allCompanies = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            List<CompanyDto> pageOfCompanies = getCompanies(apiKey, i);
            if (pageOfCompanies.isEmpty()) break;
            allCompanies.addAll(pageOfCompanies);
        }

        for (CompanyDto dto : allCompanies) {
            companyRepository.findByCompanyId(dto.id()).ifPresentOrElse(
                c -> { c.setCompanyName(dto.name()); c.setDescription(dto.summary()); c.setWebsiteUrl(dto.homepage()); c.setBusinessNumber(dto.businessNumber()); c.setLogoUrl(dto.logoUrl()); companyRepository.save(c); },
                () -> companyRepository.save(Company.builder().companyId(dto.id()).companyName(dto.name()).description(dto.summary()).websiteUrl(dto.homepage()).businessNumber(dto.businessNumber()).logoUrl(dto.logoUrl()).build())
            );
        }
        System.out.println("Finished: Company Synchronization. Total items processed: " + allCompanies.size());
    }

    private String getApiKey() {
        String apiKey = dotenv.get("work24_key");
        if (apiKey == null || apiKey.isBlank()) { System.err.println("CRITICAL: 'work24_key' not found in .env file."); return null; }
        return apiKey;
    }

    private List<JobDto> getJobs(String apiKey, int page) {
        String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L21.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + page + "&display=100";
        try {
            String xml = fetchXmlFromUrl(url);
            if (xml.contains("<error>")) { System.err.println("work24 API Error (Jobs): " + getTagValueFromRawXml(xml, "error")); return List.of(); }
            Document doc = parseXml(xml);
            NodeList nodeList = doc.getElementsByTagName("dhsOpenEmpInfo");
            List<JobDto> list = new ArrayList<>();
            for (int i = 0; i < nodeList.getLength(); i++) {
                Element e = (Element) nodeList.item(i);
                String id = getTagValue(e, "empSeqno");
                if (id == null || id.isBlank()) continue;
                list.add(new JobDto(id, getTagValue(e, "empBusiNm"), getTagValue(e, "empWantedTitle"), getTagValue(e, "empWantedTypeNm"), getTagValue(e, "coClcdNm")));
            }
            return list;
        } catch (Exception e) { e.printStackTrace(); return List.of(); }
    }

    private List<EventDto> getEvents(String apiKey, int page) {
        String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L11.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + page + "&display=100";
        try {
            String xml = fetchXmlFromUrl(url);
            if (xml.contains("<error>")) { System.err.println("work24 API Error (Events): " + getTagValueFromRawXml(xml, "error")); return List.of(); }
            Document doc = parseXml(xml);
            NodeList nodeList = doc.getElementsByTagName("empEvent");
            List<EventDto> list = new ArrayList<>();
            for (int i = 0; i < nodeList.getLength(); i++) {
                Element e = (Element) nodeList.item(i);
                String id = getTagValue(e, "eventNo");
                if (id == null || id.isBlank()) continue;
                list.add(new EventDto(id, getTagValue(e, "eventNm"), getTagValue(e, "eventTerm"), getTagValue(e, "area")));
            }
            return list;
        } catch (Exception e) { e.printStackTrace(); return List.of(); }
    }

    private List<CompanyDto> getCompanies(String apiKey, int page) {
        String url = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L31.do?authKey=" + apiKey + "&callTp=L&returnType=XML&startPage=" + page + "&display=100";
        try {
            String xml = fetchXmlFromUrl(url);
            if (xml.contains("<error>")) { System.err.println("work24 API Error (Companies): " + getTagValueFromRawXml(xml, "error")); return List.of(); }
            Document doc = parseXml(xml);
            NodeList nodeList = doc.getElementsByTagName("dhsOpenEmpHireInfo");
            List<CompanyDto> list = new ArrayList<>();
            for (int i = 0; i < nodeList.getLength(); i++) {
                Element e = (Element) nodeList.item(i);
                String id = getTagValue(e, "empCoNo");
                if (id == null || id.isBlank()) continue;
                list.add(new CompanyDto(id, getTagValue(e, "coClcdNm"), getTagValue(e, "coIntroSummaryCont"), getTagValue(e, "homepg"), getTagValue(e, "busino"), getTagValue(e, "regLogImgNm")));
            }
            return list;
        } catch (Exception e) { e.printStackTrace(); return List.of(); }
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

    private Document parseXml(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new InputSource(new StringReader(xml)));
    }

    private String getTagValue(Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            Node node = nodeList.item(0).getFirstChild();
            if (node != null) { return node.getNodeValue(); }
        }
        return "";
    }

    private String getTagValueFromRawXml(String xml, String tagName) {
        try {
            return xml.split("<" + tagName + ">")[1].split("</" + tagName + ">")[0];
        } catch (Exception e) { return ""; }
    }
}
