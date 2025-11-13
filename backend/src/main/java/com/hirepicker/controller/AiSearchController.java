package com.hirepicker.controller;

import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.GoogleSearch;
import com.google.genai.types.Tool;
import com.hirepicker.dto.chatbot.ChatRequestDto;
import com.hirepicker.dto.chatbot.ChatResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Tag(name = "AI 검색", description = "AI 웹 검색 챗봇 관련 API")
@RestController
@RequestMapping("/api/v1/ai-search") // Google Search 전용
@RequiredArgsConstructor
@Slf4j
public class AiSearchController {

    private final Client genaiClient;

    // 챗봇 세션을 저장하는 맵 (세션 ID -> Chat 객체)
    private final Map<String, Chat> chatSessions = new ConcurrentHashMap<>();

    @Operation(summary = "AI 웹 검색", description = "Google Search를 활용한 AI 검색 챗봇과 대화합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<ChatResponseDto> handleSearch(
            @Parameter(description = "검색 요청 (프롬프트 및 세션 ID)", required = true) @RequestBody ChatRequestDto request) {
        try {
            // 세션 ID가 없으면 새로 생성
            String sessionId = Optional.ofNullable(request.sessionId())
                    .orElseGet(() -> UUID.randomUUID().toString());

            // 기존 세션 가져오기 또는 새로운 세션 생성
            Chat chat = chatSessions.computeIfAbsent(sessionId, k -> {
                Tool googleSearchTool = Tool.builder()
                        .googleSearch(GoogleSearch.builder().build())
                        .build();

                GenerateContentConfig config = GenerateContentConfig.builder()
                        .tools(List.of(googleSearchTool)) // 검색만 등록
                        .build();

                return genaiClient.chats.create("gemini-2.5-flash", config);
            });

            String prompt = request.prompt() == null ? "" : request.prompt();
            GenerateContentResponse response = chat.sendMessage(
                    // 예: 후처리 지시문 포함
                    """
                    너는 사용자의 질문에 대해 웹 검색을 수행하고 그 결과를 요약해주는 챗봇이야. 아래 지침을 따라서 사용자의 질문에 답변해줘.

                    1.  **질문의 의도를 명확히 파악해줘.** 사용자의 질문이 웹 검색이 필요한 정보성 질문인지, 아니면 간단한 인사나 일반적인 대화인지 먼저 파악해야 해.
                    2.  **불필요한 검색은 절대 하지마.** 간단한 인사나 일반적인 대화에는 웹 검색을 수행하지 않고, 친절하고 자연스럽게 대답해줘.
                    3.  **대화의 맥락을 최대한 고려해줘.** 사용자가 이전에 했던 말을 참고해서, 새로운 질문의 의도를 더 정확하게 파악해줘.
                    4.  **검색 결과는 명확하게 요약하고 출처를 밝혀줘.** 웹 검색이 필요한 질문이라면, 검색 결과를 명확하고 간결하게 요약하고, 정보의 출처(도메인) 목록을 끝에 bullet point로 나열해줘.

                    **대화 예시:**
                    - 사용자: 안녕
                    - 너: 안녕하세요! 무엇이 궁금하신가요?

                    - 사용자: 테슬라 주가 알려줘. 그리고 최근에 나온 신차 정보도.
                    - 너: (웹 검색을 수행하여 테슬라의 현재 주가와 최근 신차 정보를 각각 검색하고, 요약하여 출처와 함께 답변)

                    ---
                    이제 사용자의 질문에 답변해줘.
                    - 사용자의 질문: %s
                    """.formatted(prompt)
            );

            String finalText = response.text();
            if (finalText == null) finalText = "";
            return ResponseEntity.ok(new ChatResponseDto(finalText, sessionId));

        } catch (Exception e) {
            log.error("AI Search 처리 중 오류", e);
            return ResponseEntity.internalServerError()
                    .body(new ChatResponseDto("죄송합니다. 검색 처리 중 오류가 발생했습니다.", null));
        }
    }
}
