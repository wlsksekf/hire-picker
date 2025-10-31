package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.hirepicker.entity.Certification;
import com.hirepicker.entity.School;
import com.hirepicker.repository.CertificationRepository;
import com.hirepicker.repository.SchoolRepository;

import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManageService {
    
    // 학교 데이터 저장을 위한 리포지토리
    private final SchoolRepository schoolRepository;
    
    // 자격증 데이터 저장을 위한 리포지토리
    private final CertificationRepository certificationRepository;

    @Value("${school-key}")
    private String schoolKey;
    
    @Value("${certification-key}")
    private String certificationKey;

    // 학교 데이터 업데이트 시도하는 메서드
    public ResponseEntity<String> updateSchool() {
        // 1. 외부 API에서 학교 데이터를 가져옴
        List<Map<String, Object>> schoolList = fetchSchoolData();
        
        // 2. 데이터가 비어있으면 에러 반환
        if (schoolList.isEmpty()) {
            return ResponseEntity.status(500).body("Error: Failed to fetch school data");
        }

        // 3. 가져온 데이터를 DB에 저장 (업데이트 또는 인서트)
        try {
            saveSchoolData(schoolList);
            return ResponseEntity.ok("Successfully processed " + schoolList.size() + " schools");
        } catch (Exception e) {
            System.err.println("Error saving school data to database: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: Failed to save school data to database");
        }
    }
    
    // 학교 데이터 가져오기 (대학교 + 고등학교)
    public List<Map<String, Object>> fetchSchoolData() {
        // 1. 학교 API 키 검증
        String apiKey = validateApiKey(schoolKey, "school-key");
        if (apiKey == null) {
            System.err.println("API key not found");
            return List.of();
        }
        
        // 2. API 호출 URL 구성 (기본 URL)
        String baseUrlString = "https://www.career.go.kr/cnet/openapi/getOpenApi?apiKey=" + apiKey +
         "&svcType=api&svcCode=SCHOOL&contentType=json&perPage=3000";
        
        List<Map<String, Object>> allSchoolList = new ArrayList<>();
        
        try {
            // 3. 대학교 데이터 가져오기
            List<Map<String, Object>> univList = fetchSchoolDataByType(baseUrlString, "univ_list");
            if (!univList.isEmpty()) {
                allSchoolList.addAll(univList);
                System.out.println("대학교 데이터 " + univList.size() + "개 가져옴");
            }
            
            // 4. 고등학교 데이터 가져오기
            List<Map<String, Object>> highList = fetchSchoolDataByType(baseUrlString, "high_list");
            if (!highList.isEmpty()) {
                allSchoolList.addAll(highList);
                System.out.println("고등학교 데이터 " + highList.size() + "개 가져옴");
            }
            
            System.out.println("전체 학교 데이터 " + allSchoolList.size() + "개 가져옴");
            return allSchoolList;
            
        } catch (Exception e) {
            System.err.println("Error fetching school data: " + e.getMessage());
            return List.of();
        }
    }
    
    // 특정 타입의 학교 데이터를 가져오는 헬퍼 메서드
    private List<Map<String, Object>> fetchSchoolDataByType(String baseUrlString, String gubun) {
        try {
            // HTTP 연결 설정
            URL url = new URL(baseUrlString + "&gubun=" + gubun);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");
            
            // 응답 코드 확인
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // 응답 데이터 읽기
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                // JSON 문자열을 파싱해서 학교 리스트로 변환
                String jsonResponse = response.toString();
                return parseSchoolData(jsonResponse);
            } else {
                System.err.println("API call failed for " + gubun + " with status: " + responseCode);
                return List.of();
            }
        } catch (Exception e) {
            System.err.println("Error fetching " + gubun + " data: " + e.getMessage());
            return List.of();
        }
    }
    
    // JSON 응답을 파싱해서 학교 데이터 리스트로 변환
    private List<Map<String, Object>> parseSchoolData(String jsonResponse) {
        try {
            // 1. JSON 문자열을 JSONObject로 변환
            //    - JSONObject: org.json 라이브러리의 핵심 클래스
            //    - JSON 문자열을 파싱하여 키-값 쌍으로 접근 가능한 객체 생성
            //    - 예: {"name": "서울대"} → jsonObject.getString("name") 으로 접근
            JSONObject jsonObject = new JSONObject(jsonResponse);
            
            // 2. 최상위 JSON에서 "dataSearch" 객체 추출
            //    - has(): 해당 키가 존재하는지 확인
            //    - getJSONObject(): 중첩된 JSON 객체를 JSONObject로 가져오기
            //    - JSON 구조: {"dataSearch": {"content": [...]}}
            if (!jsonObject.has("dataSearch")) {
                System.err.println("'dataSearch' key not found in JSON response");
                return List.of();//  List.of() : 빈 리스트 반환
            }
            JSONObject dataSearch = jsonObject.getJSONObject("dataSearch");
            
            // 3. dataSearch 안에 "content" 배열이 있는지 확인
            if (!dataSearch.has("content")) {
                System.err.println("'content' key not found in dataSearch");
                return List.of();
            }
            
            // 4. content를 JSONArray로 추출
            //    - JSONArray: JSON 배열을 다루는 클래스
            //    - 배열의 각 요소에 인덱스로 접근 가능
            JSONArray contentArray = dataSearch.getJSONArray("content");
            
            // 5. JSONArray를 List<Map<String, Object>>로 변환
            //    - 각 JSON 객체를 Map으로 변환하여 리스트에 추가
            List<Map<String, Object>> schoolList = new ArrayList<>();
            
            // 6. 배열의 각 요소를 순회하며 Map으로 변환
            for (int i = 0; i < contentArray.length(); i++) {
                // 6-1. 배열의 i번째 요소를 JSONObject로 가져오기
                JSONObject schoolObject = contentArray.getJSONObject(i);
                
                // 6-2. JSONObject를 Map으로 변환
                //      - toMap(): JSONObject의 모든 키-값을 Map으로 변환
                Map<String, Object> schoolMap = schoolObject.toMap();
                
                // 6-3. 변환된 Map을 리스트에 추가
                schoolList.add(schoolMap);
            }
            System.out.println("schoolList: " + schoolList);
            // 7. 변환된 학교 리스트 반환
            return schoolList;
            
        } catch (Exception e) {
            System.err.println("Error parsing JSON response: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    // API 데이터를 School 엔티티로 변환하는 메서드
    private School convertToSchoolEntity(Map<String, Object> schoolData) {
        School school = new School();
        
        // API 데이터에서 필요한 필드 추출하여 엔티티에 설정
        school.setSchoolName((String) schoolData.get("schoolName"));
        school.setSchoolType((String) schoolData.get("schoolType"));
        school.setAddress((String) schoolData.get("adres"));
        school.setCampus((String) schoolData.get("campusName"));
        school.setSchoolUrl((String) schoolData.get("link"));
        
        return school;
    }
    
    // 학교 데이터를 DB에 저장하는 메서드 (업데이트 또는 인서트)
    private void saveSchoolData(List<Map<String, Object>> schoolList) {
        int insertCount = 0;
        int updateCount = 0;
        
        for (Map<String, Object> schoolData : schoolList) {
            // API 데이터를 School 엔티티로 변환
            School newSchool = convertToSchoolEntity(schoolData);
            
            // schoolName과 campus로 기존 데이터 조회
            Optional<School> existingSchool = schoolRepository.findBySchoolNameAndCampus(
                newSchool.getSchoolName(), 
                newSchool.getCampus()
            );
            
            if (existingSchool.isPresent()) {
                // 기존 데이터가 있으면 업데이트
                School schoolToUpdate = existingSchool.get();
                schoolToUpdate.setSchoolType(newSchool.getSchoolType());
                schoolToUpdate.setAddress(newSchool.getAddress());
                schoolToUpdate.setSchoolUrl(newSchool.getSchoolUrl());
                
                schoolRepository.save(schoolToUpdate);
                updateCount++;
            } else {
                // 기존 데이터가 없으면 새로 인서트
                schoolRepository.save(newSchool);
                insertCount++;
            }
        }
        
        System.out.println("DB 저장 완료 - 신규 인서트: " + insertCount + "개, 업데이트: " + updateCount + "개");
    }

    // =========================
    // 자격증 관련 메서드
    // =========================
    
    // 자격증 데이터 업데이트 시도하는 메서드
    public ResponseEntity<String> updateCertification() {
        // 1. Q-Net API에서 자격증 데이터를 가져옴
        List<Map<String, Object>> certList = fetchCertificationData();
        
        // 2. 데이터가 비어있으면 에러 반환
        if (certList.isEmpty()) {
            return ResponseEntity.status(500).body("Error: Failed to fetch certification data");
        }
        
        // 3. 가져온 데이터를 DB에 저장 (업데이트 또는 인서트)
        try {
            saveCertificationData(certList);
            return ResponseEntity.ok("Successfully processed " + certList.size() + " certifications");
        } catch (Exception e) {
            System.err.println("Error saving certification data to database: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: Failed to save certification data to database");
        }
    }
    
    // 자격증 데이터 가져오기
    public List<Map<String, Object>> fetchCertificationData() {
        // 1. 자격증 API 키 검증
        String apiKey = validateApiKey(certificationKey, "certification-key");
        if (apiKey == null) {
            System.err.println("Certification API key not found");
            return List.of();
        }
        
        // 2. Q-Net API URL 구성
        String apiUrl = "http://openapi.q-net.or.kr/api/service/rest/" +
                       "InquiryListNationalQualifcationSVC/getList?" +
                       "serviceKey=" + apiKey + "&_type=json";
        
        try {
            // 3. HTTP 연결 설정
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");
            
            // 4. 응답 코드 확인
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // 5. 응답 데이터 읽기
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream())
                );
                StringBuilder response = new StringBuilder();
                String line;
                
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                // 6. JSON 파싱
                String jsonResponse = response.toString();
                List<Map<String, Object>> certList = parseCertificationData(jsonResponse);
                System.out.println("자격증 데이터 " + certList.size() + "개 가져옴");
                return certList;
                
            } else {
                System.err.println("Q-Net API call failed with status: " + responseCode);
                return List.of();
            }
        } catch (Exception e) {
            System.err.println("Error fetching certification data: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    // JSON 응답을 파싱해서 자격증 데이터 리스트로 변환
    private List<Map<String, Object>> parseCertificationData(String jsonResponse) {
        try {
            // 1. JSON 문자열을 JSONObject로 변환
            JSONObject jsonObject = new JSONObject(jsonResponse);
            
            // 2. Q-Net API 응답 구조 파싱
            // 실제 구조: {"response": {"header": {...}, "body": {"items": {"item": [...]}}}}
            if (!jsonObject.has("response")) {
                System.err.println("'response' key not found in JSON");
                return List.of();
            }
            
            JSONObject response = jsonObject.getJSONObject("response");
            
            // 2-1. header 확인 (에러 체크)
            if (response.has("header")) {
                JSONObject header = response.getJSONObject("header");
                String resultCode = header.optString("resultCode", "");
                String resultMsg = header.optString("resultMsg", "");
                
                System.out.println("API 응답 코드: " + resultCode + ", 메시지: " + resultMsg);
                
                // resultCode가 "00"이 아니면 에러
                if (!"00".equals(resultCode)) {
                    System.err.println("API 에러 응답: " + resultMsg);
                    return List.of();
                }
            }
            
            // 2-2. body 확인
            if (!response.has("body")) {
                System.err.println("'body' key not found in response");
                return List.of();
            }
            
            // body가 String인 경우 (에러 응답) 처리
            Object bodyObj = response.get("body");
            if (bodyObj instanceof String) {
                System.err.println("API returned error in body: " + bodyObj);
                return List.of();
            }
            
            JSONObject body = response.getJSONObject("body");
            
            // 2-3. items 확인
            if (!body.has("items")) {
                System.err.println("'items' key not found in body");
                return List.of();
            }
            
            // 3. items에서 item 배열 추출
            // Q-Net API 구조: {"items": {"item": [...]}}
            JSONObject items = body.getJSONObject("items");
            
            if (!items.has("item")) {
                System.err.println("'item' key not found in items");
                return List.of();
            }
            
            // 4. item을 배열로 변환
            Object itemObj = items.get("item");
            JSONArray itemArray;
            
            if (itemObj instanceof JSONArray) {
                // 일반적인 경우: 여러 개의 자격증
                itemArray = (JSONArray) itemObj;
            } else if (itemObj instanceof JSONObject) {
                // 자격증이 1개만 있는 경우
                itemArray = new JSONArray();
                itemArray.put(itemObj);
            } else {
                System.err.println("Unexpected item type: " + itemObj.getClass().getName());
                return List.of();
            }
            
            // 5. JSONArray를 List<Map>으로 변환
            List<Map<String, Object>> certList = new ArrayList<>();
            
            for (int i = 0; i < itemArray.length(); i++) {
                JSONObject certObject = itemArray.getJSONObject(i);
                Map<String, Object> certMap = certObject.toMap();
                certList.add(certMap);
            }
            
            System.out.println("파싱 완료: " + certList.size() + "개의 자격증 데이터");
            return certList;
            
        } catch (Exception e) {
            System.err.println("Error parsing certification JSON response: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    // API 데이터를 Certification 엔티티로 변환하는 메서드
    private Certification convertToCertificationEntity(Map<String, Object> certData) {
        Certification cert = new Certification();
        
        // API 응답 필드를 엔티티 필드로 매핑
        // Q-Net API의 실제 필드명에 따라 수정 필요
        // 예: jmfldnm (종목명), mdobligfldnm (주무부처명) 등
        Object certNameObj = certData.get("jmfldnm");
        if (certNameObj != null) {
            cert.setCertName(certNameObj.toString());
        }
        
        return cert;
    }
    
    // 자격증 데이터를 DB에 저장하는 메서드 (중복 방지 로직 포함)
    private void saveCertificationData(List<Map<String, Object>> certList) {
        int insertCount = 0;
        int duplicateCount = 0;
        int skipCount = 0;
        
        // 1. DB에서 기존 자격증 이름 전체 조회 (1번의 DB 조회)
        List<Certification> existingCerts = certificationRepository.findAll();
        
        // 1-1. DB에 있는 자격증 이름들을 Set에 담기 (중복 체크용)
        Set<String> existingCertNames = new HashSet<>();
        for (Certification cert : existingCerts) {
            String certName = cert.getCertName();
            // null이 아니고 비어있지 않은 이름만 Set에 추가
            if (certName != null && !certName.isBlank()) {
                existingCertNames.add(certName);
            }
        }
        
        System.out.println("기존 DB에 저장된 자격증 수: " + existingCertNames.size() + "개");
        
        // 2. API에서 받은 자격증 데이터 처리
        for (Map<String, Object> certData : certList) {
            // 2-1. 엔티티 변환
            Certification newCert = convertToCertificationEntity(certData);
            
            // 2-2. certName이 null이거나 비어있으면 스킵
            if (newCert.getCertName() == null || newCert.getCertName().isBlank()) {
                skipCount++;
                continue;
            }
            
            // 2-3. 중복 체크 (Set에서 O(1) 시간 복잡도로 확인)
            if (existingCertNames.contains(newCert.getCertName())) {
                // 이미 존재하는 자격증이면 insert 하지 않음
                duplicateCount++;
            } else {
                // 3. 신규 자격증만 insert
                certificationRepository.save(newCert);
                // 저장 후 Set에도 추가 (같은 API 응답 내 중복 방지)
                existingCertNames.add(newCert.getCertName());
                insertCount++;
            }
        }
        
        System.out.println("자격증 DB 저장 완료:");
        System.out.println("  - 신규 인서트: " + insertCount + "개");
        System.out.println("  - 중복으로 스킵: " + duplicateCount + "개");
        if (skipCount > 0) {
            System.out.println("  - 유효하지 않아 스킵: " + skipCount + "개");
        }
    }
    
    // =========================
    // 공통 유틸리티 메서드
    // =========================
    
    /**
     * API 키 유효성 검증 메서드
     * @Value 어노테이션으로 이미 주입된 API 키가 null이거나 비어있는지 검증
     * @param keyValue - 검증할 API 키 값 (이미 주입된 값)
     * @param keyName - 로깅을 위한 키 이름
     * @return 유효한 API 키 또는 null
     */
    private String validateApiKey(String keyValue, String keyName) {
        if (keyValue == null || keyValue.isBlank()) {
            System.err.println("CRITICAL: '" + keyName + "' not found or empty in application.yml");
            return null;
        }
        return keyValue;
    }
}
