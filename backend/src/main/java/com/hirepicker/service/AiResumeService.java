package com.hirepicker.service;

import com.hirepicker.dto.ai.FullResumeDraftDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * AI 기반 자기소개서 초안 생성 서비스
 * - Spring AI (Vertex AI Gemini) 기반
 * - 사용자가 제공한 키워드로 전문적인 자기소개서 초안을 생성
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiResumeService {

    private final VertexAiGeminiChatModel chatModel;
    // private final CreditService creditService; // 결제/크레딧 연동 시 주입

    /**
     * 사용자 키워드를 기반으로 AI 자기소개서 초안 생성
     * @param userKeywords 사용자 제공 키워드 (예: "성실함, 리더십, 협업능력, 개발자")
     * @param userId 사용자 ID (추후 크레딧 차감용)
     * @return 생성된 자기소개서 초안 DTO
     */
    public FullResumeDraftDto generateFullDraft(String userKeywords, Long userId) {

        // (선택) 크레딧 차감 로직 예시
        // creditService.useCredits(userId, 10, "AI 자기소개서 초안 생성");

        var outputConverter = new BeanOutputConverter<>(FullResumeDraftDto.class);

        // 🧠 시스템 프롬프트
        String systemMessageTemplate = """
            당신은 취업 플랫폼 'hirepicker'의 전문 이력서 코치입니다.
            사용자가 제공한 핵심 키워드를 바탕으로 다음 네 가지 항목을
            전문적이고 설득력 있게 한국어로 작성하세요.

            [작성 항목]
            1. 성장과정 (growthProcess)
            2. 업무 관련 역량 (jobCompetencies)
            3. 성격 장단점 (prosAndCons)
            4. 입사 후 포부 (aspirations)

            각 항목은 300~500자 내외로 작성해야 합니다.
            반드시 아래 JSON 형식으로만 응답하세요:
            {format}
            """;

        var systemPrompt = new SystemPromptTemplate(systemMessageTemplate)
                .createMessage(Map.of("format", outputConverter.getFormat()));

        var userMessage = new UserMessage("다음은 사용자의 핵심 키워드입니다: " + userKeywords);

        // 🧩 최종 프롬프트 구성
        Prompt finalPrompt = new Prompt(List.of(systemPrompt, userMessage));

        try {
            // 🤖 Gemini 모델 호출
            ChatResponse chatResponse = chatModel.call(finalPrompt);

            Generation generation = chatResponse.getResult();
            if (generation == null || generation.getOutput() == null) {
                log.error("Gemini 응답 결과 또는 내용이 비어 있습니다. (userId: {})", userId);
                throw new IllegalStateException("AI 응답 결과 또는 내용이 비어 있습니다.");
            }

            // [WORKAROUND] IDE 컴파일 오류 우회를 위해 Reflection 사용
            String aiOutput;
            try {
                Object assistantMessage = generation.getOutput();
                java.lang.reflect.Method getContentMethod = assistantMessage.getClass().getMethod("getContent");
                aiOutput = (String) getContentMethod.invoke(assistantMessage);
            } catch (Exception e) {
                log.error("AI 응답 내용을 Reflection으로 가져오는 중 오류 발생: {}", e.getMessage(), e);
                throw new RuntimeException("AI 응답 내용을 가져오는 중 오류가 발생했습니다. IDE의 Gradle 프로젝트 새로고침을 권장합니다.", e);
            }

            if (aiOutput == null || aiOutput.isBlank()) {
                log.error("Gemini 응답 내용이 비어 있습니다. (userId: {})", userId);
                throw new IllegalStateException("AI 응답 내용은 비어 있습니다.");
            }
            
            log.info("AI raw output: {}", aiOutput);

            // [WORKAROUND] IDE 컴파일 오류 우회를 위해 ObjectMapper 직접 사용
            try {
                // AI가 생성한 JSON 앞뒤의 ```json ... ``` 마크다운을 제거합니다.
                String jsonContent = aiOutput.trim().replace("```json", "").replace("```", "").trim();
                
                com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return objectMapper.readValue(jsonContent, FullResumeDraftDto.class);
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                log.error("AI 응답 JSON 파싱 중 오류 발생: {}", e.getMessage(), e);
                throw new RuntimeException("AI 응답을 파싱하는 중 오류가 발생했습니다.", e);
            }

        } catch (Exception e) {
            log.error("AI 자기소개서 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("AI 자기소개서 생성 중 오류가 발생했습니다.", e);
        }
    }
}