package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

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
