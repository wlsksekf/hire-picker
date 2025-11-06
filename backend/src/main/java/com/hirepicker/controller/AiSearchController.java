package com.hirepicker.controller;

import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.GoogleSearch;
import com.google.genai.types.Tool;
import com.hirepicker.dto.chatbot.ChatRequestDto;
import com.hirepicker.dto.chatbot.ChatResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai-search") // Google Search 전용
@RequiredArgsConstructor
@Slf4j
public class AiSearchController {

    private final Client genaiClient;

    @PostMapping
    public ResponseEntity<ChatResponseDto> handleSearch(@RequestBody ChatRequestDto request) {
        try {
            Tool googleSearchTool = Tool.builder()
                    .googleSearch(GoogleSearch.builder().build())
                    .build();

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .tools(List.of(googleSearchTool)) // 검색만 등록
                    .build();

            Chat chat = genaiClient.chats.create("gemini-2.5-flash", config);

            String prompt = request.prompt() == null ? "" : request.prompt();
            GenerateContentResponse response = chat.sendMessage(
                    // 예: 후처리 지시문 포함
                    """
                    아래 질의어로 웹 검색을 수행해.
                    - 질의어: %s
                    - 원문을 요약하고, 출처(도메인) 목록을 끝에 bullet로 나열해.
                    """.formatted(prompt)
            );

            String finalText = response.text();
            if (finalText == null) finalText = "";
            return ResponseEntity.ok(new ChatResponseDto(finalText));

        } catch (Exception e) {
            log.error("AI Search 처리 중 오류", e);
            return ResponseEntity.internalServerError()
                    .body(new ChatResponseDto("죄송합니다. 검색 처리 중 오류가 발생했습니다."));
        }
    }
}
