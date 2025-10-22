package com.hirepicker.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManageService {
    // .env 파일에서 키 가져오기위한 객체
    private final Dotenv dotenv;

    public ResponseEntity<String> updateSchool() {
        String apiKey = getSchoolKey();
        String urlString = "https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=" + apiKey;
        try {
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuffer response = new StringBuffer();
                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();
                return ResponseEntity.ok(response.toString());
            } else {
                return ResponseEntity.status(responseCode).body("Error: " + responseCode);
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    private String getSchoolKey() {
        String apiKey = dotenv.get("school_key");
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("CRITICAL: 'school_key' not found in .env file.");
            return null;
        }
        return apiKey;
    }
}
