package com.hirepicker.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.hirepicker.dto.ai.FullResumeDraftDto;
import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

// AI 이력서 초안 생성을 담당하는 서비스
@Service
@Slf4j
public class AiResumeService {

    private final Client client;

    // 생성자를 통해 환경변수를 로드하고 Gemini 클라이언트를 초기화
    public AiResumeService() {
        // .env 파일의 위치를 상위 폴더로 지정하여 환경 변수를 로드
        Dotenv dotenv = Dotenv.configure().directory("../").load();
        // GOOGLE_API_KEY 환경변수를 사용하여 클라이언트 초기화
        this.client = new Client();
    }

    // 사용자 데이터와 채용 공고를 기반으로 완전한 이력서 초안 생성
    public FullResumeDraftDto generateFullResumeDraft(String userData, String jobPostingData) {
        try {
            // AI에게 역할을 부여하고, 원하는 결과물의 형식과 스타일을 지정하는 시스템 프롬프트
            String systemPrompt = "당신은 대한민국 최고의 커리어 컨설턴트입니다. " +
                    "주어진 사용자 정보와 채용 공고를 바탕으로, 각 항목에 대해 200자에서 400자 사이의 글자 수로 자기소개서 초안을 작성해 주세요. " +
                    "결과는 반드시 다음 키를 사용하는 JSON 형식으로 반환해야 합니다: " +
                    "growthProcess, jobCompetencies, prosAndCons, aspirations.";

            // AI에게 전달할 사용자 데이터와 채용 공고 정보
            String jobInfo = (jobPostingData != null && !jobPostingData.isBlank())
                    ? jobPostingData
                    : "(특별한 채용 공고 정보나 요청사항 없음)";
            String userPrompt = "## 사용자 정보\n" + userData + "\n\n" + "## 채용 공고/요청사항\n" + jobInfo;

            // AI 모델 설정 (시스템 프롬프트 포함)
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(
                            Content.fromParts(Part.fromText(systemPrompt)))
                    .build();

            // Gemini 모델에 콘텐츠 생성 요청 (models는 필드)
            GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash", userPrompt, config);

            // AI의 응답 텍스트에서 JSON 부분만 추출
            String responseText = response.text();
            int startIndex = responseText.indexOf('{');
            int endIndex = responseText.lastIndexOf('}');

            // AI가 JSON이 아닌 일반 텍스트 에러 메시지를 반환하는 경우에 대한 방어 코드
            if (startIndex == -1 || endIndex == -1 || endIndex < startIndex) {
                log.error("AI로부터 유효한 JSON 응답을 받지 못했습니다. 응답 내용: {}", responseText);
                throw new RuntimeException("AI로부터 유효한 JSON 응답을 받지 못했습니다.");
            }

            String jsonString = responseText.substring(startIndex, endIndex + 1);

            // 추출된 JSON 문자열을 파싱
            JSONObject jsonResponse = new JSONObject(jsonString);

            // JSON 객체에서 각 항목의 값을 추출하여 DTO 객체로 변환 후 반환
            return new FullResumeDraftDto(
                    jsonResponse.getString("growthProcess"),
                    jsonResponse.getString("jobCompetencies"),
                    jsonResponse.getString("prosAndCons"),
                    jsonResponse.getString("aspirations")
            );
        } catch (Throwable t) {
            log.error("!!! AiResumeService에서 예측하지 못한 에러 발생 !!!", t);
            throw new RuntimeException("AI 이력서 생성 중 예측하지 못한 에러가 발생했습니다.", t);
        }
    }
}