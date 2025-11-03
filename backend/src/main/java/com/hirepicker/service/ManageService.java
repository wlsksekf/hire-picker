package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.core.type.TypeReference; // Jackson 타입 변환
import com.fasterxml.jackson.databind.JsonNode; // Jackson 트리 모델
import com.fasterxml.jackson.databind.ObjectMapper; // Jackson 파서
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import com.hirepicker.entity.Certification;
import com.hirepicker.entity.School;
import com.hirepicker.repository.CertificationRepository;
import com.hirepicker.repository.SchoolRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManageService {

    // 리포지토리 의존성
    private final SchoolRepository schoolRepository;
    private final CertificationRepository certificationRepository;

    @Value("${school-key}")
    private String schoolKey;

    @Value("${certification-key}")
    private String certificationKey;

    // 학교 데이터 업데이트 엔드포인트
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

    // 학교 데이터 수집(대학 + 고등학교)
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

    // 특정 구분(gubun)별 학교 데이터 호출
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

    // 학교 JSON 파싱(Jackson)
    private List<Map<String, Object>> parseSchoolData(String jsonResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);

            JsonNode dataSearch = root.path("dataSearch");
            if (dataSearch.isMissingNode() || dataSearch.isNull()) return List.of();

            JsonNode content = dataSearch.path("content");
            if (!content.isArray()) return List.of();

            List<Map<String, Object>> list = new ArrayList<>();
            for (JsonNode elem : content) {
                Map<String, Object> map = mapper.convertValue(elem, new TypeReference<Map<String, Object>>() {});
                list.add(map);
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // API 맵을 School 엔티티로 변환
    private School convertToSchoolEntity(Map<String, Object> schoolData) {
        School s = new School();
        s.setSchoolName((String) schoolData.get("schoolName"));
        s.setSchoolType((String) schoolData.get("schoolType"));
        s.setAddress((String) schoolData.get("adres"));
        s.setCampus((String) schoolData.get("campusName"));
        s.setSchoolUrl((String) schoolData.get("link"));
        return s;
    }

    // 학교 데이터 저장/갱신
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

    // 자격증 데이터 업데이트 엔드포인트
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

    // 자격증 데이터 수집
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

    // 자격증 JSON 파싱(Jackson)
    private List<Map<String, Object>> parseCertificationData(String jsonResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);

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
                    list.add(mapper.convertValue(elem, new TypeReference<Map<String, Object>>() {}));
                }
            } else if (itemNode.isObject()) {
                list.add(mapper.convertValue(itemNode, new TypeReference<Map<String, Object>>() {}));
            }
            return list;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // API 맵을 Certification 엔티티로 변환
    private Certification convertToCertificationEntity(Map<String, Object> certData) {
        Certification c = new Certification();
        Object certNameObj = certData.get("jmfldnm"); // 종목명 필드명 예시
        if (certNameObj != null) c.setCertName(certNameObj.toString());
        return c;
    }

    // 자격증 데이터 저장(중복 방지)
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

    // API 키 검증(없으면 null)
    private String validateApiKey(String key, String name) {
        if (key == null || key.isBlank()) {
            System.err.println("API key not found: " + name);
            return null;
        }
        return key;
    }
}

