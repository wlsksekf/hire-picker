package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManageService {
    // .env 파일에서 키 가져오기위한 객체
    private final Dotenv dotenv;

    // 학교 데이터 업데이트 시도하는 메서드
    public ResponseEntity<String> updateSchool() {
        // 1. 외부 API에서 학교 데이터를 가져옴
        List<Map<String, Object>> schoolList = fetchSchoolData();
        
        // 2. 데이터가 비어있으면 에러 반환
        if (schoolList.isEmpty()) {
            return ResponseEntity.status(500).body("Error: Failed to fetch school data");
        }
        
        // 3. 성공적으로 가져온 학교 개수 반환
        return ResponseEntity.ok("Successfully fetched " + schoolList.size() + " schools");
    }
    
    // 학교 데이터 가져오기
    public List<Map<String, Object>> fetchSchoolData() {
        // 1. .env 파일에서 API 키 가져오기
        String apiKey = getSchoolKey();
        if (apiKey == null) {
            System.err.println("API key not found");
            return List.of();
        }
        
        // 2. API 호출 URL 구성 (대학교 목록, JSON 형태, 1000개씩)
        String urlString = "https://www.career.go.kr/cnet/openapi/getOpenApi?apiKey=" + apiKey +
         "&svcType=api&svcCode=SCHOOL&contentType=json&gubun=univ_list&perPage=1000";
        
        try {
            // 3. HTTP 연결 설정
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");
            
            // 4. 응답 코드 확인
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                // 5. 응답 데이터 읽기
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                // 6. JSON 문자열을 파싱해서 학교 리스트로 변환
                String jsonResponse = response.toString();
                return parseSchoolData(jsonResponse);
            } else {
                System.err.println("API call failed with status: " + responseCode);
                return List.of();
            }
        } catch (Exception e) {
            System.err.println("Error fetching school data: " + e.getMessage());
            return List.of();
        }
    }
    
    // JSON 응답을 파싱해서 학교 데이터 리스트로 변환
    private List<Map<String, Object>> parseSchoolData(String jsonResponse) {
        try {
            // 1. Jackson ObjectMapper 생성 - JSON ↔ Java 객체 변환을 담당하는 핵심 클래스
            //    - JSON 문자열을 Java 객체로 변환 (deserialization)
            //    - Java 객체를 JSON 문자열로 변환 (serialization)
            //    - Spring Boot에서 자동으로 제공되는 라이브러리
            ObjectMapper objectMapper = new ObjectMapper();
            
            // 2. JSON 문자열을 Map<String, Object>로 변환
            //    - readValue(): JSON 문자열을 지정된 타입으로 변환
            //    - Map.class: 모든 JSON 객체를 Map으로 변환 (키-값 쌍)
            //    - 예: {"name": "서울대", "type": "대학교"} → Map{"name"="서울대", "type"="대학교"}
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, Map.class);
            
            // 3. 응답에서 dataSearch 객체 추출
            //    - responseMap.get("dataSearch"): 최상위 JSON에서 "dataSearch" 키의 값 가져오기
            //    - JSON 구조: {"dataSearch": {"content": [...]}}
            Map<String, Object> dataSearch = (Map<String, Object>) responseMap.get("dataSearch");
            
            // 4. dataSearch가 존재하고 content 키가 있는지 확인
            if (dataSearch != null && dataSearch.containsKey("content")) {
                // 5. dataSearch 안의 content 배열을 학교 리스트로 변환
                //    - content는 JSON 배열이므로 List<Map<String, Object>>로 변환
                //    - 각 배열 요소는 학교 정보를 담은 JSON 객체
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) dataSearch.get("content");
                return contentList;
            }
            
            // 6. 데이터가 없으면 빈 리스트 반환
            return List.of();
        } catch (Exception e) {
            System.err.println("Error parsing JSON response: " + e.getMessage());
            return List.of();
        }
    }

    // .env 파일에서 학교 API 키를 가져오는 메서드
    private String getSchoolKey() {
        // 1. .env 파일에서 'school_key' 값 읽기
        String apiKey = dotenv.get("school_key");
        
        // 2. 키가 없거나 비어있으면 에러 로그 출력 후 null 반환
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("CRITICAL: 'school_key' not found in .env file.");
            return null;
        }
        
        // 3. 유효한 API 키 반환
        return apiKey;
    }
}
