package com.hirepicker.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value; // Value 임포트
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;

@Service // Spring의 서비스 빈으로 등록
public class TossPaymentServiceImpl implements TossPaymentService {

    private final Logger logger = LoggerFactory.getLogger(this.getClass()); // 로거
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파서

    @Value("${TOSS_WIDGET_SECRET_KEY}") // .env에서 TOSS_WIDGET_SECRET_KEY 값 주입
    private String widgetSecretKey;
    @Value("${TOSS_API_SECRET_KEY}") // .env에서 TOSS_API_SECRET_KEY 값 주입
    private String apiSecretKey;

    private final Map<String, String> billingKeyMap = new HashMap<>(); // 빌링키 저장 맵

    // 결제 승인
    @Override
    public Map<String, Object> confirmPayment(HttpServletRequest request, String jsonBody) throws Exception {
        String secretKey = request.getRequestURI().contains("/confirm/payment") ? apiSecretKey : widgetSecretKey;
        return sendRequest(parseRequestData(jsonBody), secretKey, "https://api.tosspayments.com/v1/payments/confirm");
    }

    // 자동 결제
    @Override
    public Map<String, Object> confirmBilling(String jsonBody) throws Exception {
        Map<String, Object> requestData = parseRequestData(jsonBody);
        String billingKey = billingKeyMap.get(requestData.get("customerKey"));
        return sendRequest(requestData, apiSecretKey, "https://api.tosspayments.com/v1/billing/" + billingKey);
    }

    // 빌링키 발급
    @Override
    public Map<String, Object> issueBillingKey(String jsonBody) throws Exception {
        Map<String, Object> requestData = parseRequestData(jsonBody);
        Map<String, Object> response = sendRequest(requestData, apiSecretKey,
                "https://api.tosspayments.com/v1/billing/authorizations/issue");

        if (!response.containsKey("error")) {
            billingKeyMap.put((String) requestData.get("customerKey"), (String) response.get("billingKey"));
        }
        return response;
    }

    // 브랜드페이 인증 콜백 처리
    @Override
    public Map<String, Object> callbackAuth(String customerKey, String code) throws Exception {
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("grantType", "AuthorizationCode");
        requestData.put("customerKey", customerKey);
        requestData.put("code", code);

        String url = "https://api.tosspayments.com/v1/brandpay/authorizations/access-token";
        return sendRequest(requestData, apiSecretKey, url);
    }

    // 브랜드페이 결제 승인
    @Override
    public Map<String, Object> confirmBrandpay(String jsonBody) throws Exception {
        Map<String, Object> requestData = parseRequestData(jsonBody);
        String url = "https://api.tosspayments.com/v1/brandpay/payments/confirm";
        return sendRequest(requestData, apiSecretKey, url);
    }

    // JSON 본문을 Map으로 파싱
    private Map<String, Object> parseRequestData(String jsonBody) throws IOException {
        return objectMapper.readValue(jsonBody, new TypeReference<>() {
        });
    }

    // Toss Payments API에 요청 전송
    private Map<String, Object> sendRequest(Map<String, Object> requestData, String secretKey, String urlString)
            throws IOException {
        HttpURLConnection connection = createConnection(secretKey, urlString);
        try (OutputStream os = connection.getOutputStream()) {
            os.write(objectMapper.writeValueAsBytes(requestData));
        }

        try (InputStream responseStream = connection.getResponseCode() == 200 ? connection.getInputStream()
                : connection.getErrorStream();
                Reader reader = new InputStreamReader(responseStream, StandardCharsets.UTF_8)) {
            return objectMapper.readValue(reader, new TypeReference<>() {
            });
        } catch (IOException e) {
            logger.error("응답 읽기 오류", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "응답 읽기 오류");
            return errorResponse;
        }
    }

    // HttpURLConnection 생성
    private HttpURLConnection createConnection(String secretKey, String urlString) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestProperty("Authorization",
                "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8)));
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        return connection;
    }
}
