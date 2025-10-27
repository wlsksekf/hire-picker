package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.hirepicker.entity.School;
import com.hirepicker.repository.SchoolRepository;

import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManageService {
    
    // 학교 데이터 저장을 위한 리포지토리
    private final SchoolRepository schoolRepository;

    @Value("${school-key}")
    private String schoolKey;

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
        // 1. .env 파일에서 API 키 가져오기
        String apiKey = getSchoolKey();
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

    // .env 파일에서 학교 API 키를 가져오는 메서드
    private String getSchoolKey() {
        if (schoolKey == null || schoolKey.isBlank()) {
            System.err.println("CRITICAL: 'school_key' not found in .env file.");
            return null;
        }
        return schoolKey;
    }
}
