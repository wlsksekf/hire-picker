package com.hirepicker.controller;

import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.FunctionCall;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Tool;
import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.chatbot.ChatRequestDto;
import com.hirepicker.dto.chatbot.ChatResponseDto;
import com.hirepicker.service.ChatbotToolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/ai-chat") // Function Calling 전용
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    private final ChatbotToolService chatbotToolService;
    private final Client genaiClient;

    @PostMapping
    public ResponseEntity<ChatResponseDto> handleChat(
            @RequestBody ChatRequestDto request) {

        try {
            Tool searchJobPostingsTool = chatbotToolService.getSearchJobPostingsTool();

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .tools(List.of(searchJobPostingsTool)) // 함수 호출만 등록
                    .build();

            Chat chat = genaiClient.chats.create("gemini-2.5-flash", config);

            String prompt = request.prompt() == null ? "" : request.prompt();
            GenerateContentResponse response = chat.sendMessage(prompt);

            // 함수 호출 처리
            List<FunctionCall> functionCalls = response.functionCalls();
            if (functionCalls != null && !functionCalls.isEmpty()) {
                FunctionCall fc = functionCalls.get(0);

                String fnName = fc.name() != null ? fc.name().orElse("") : "";
                if ("searchJobPostings".equals(fnName)) {
                    Optional<Map<String, Object>> argsOpt = fc.args();
                    Map<String, Object> args = (argsOpt != null) ? argsOpt.orElse(Map.of()) : Map.of();

                    String keyword = String.valueOf(args.getOrDefault("keyword", ""));
                    String location = String.valueOf(args.getOrDefault("location", ""));

                    List<Map<String, String>> dbResults =
                            chatbotToolService.searchJobPostings(keyword, location);

                    Content fnResponse = chatbotToolService.createFunctionResponse(fnName, dbResults);
                    response = chat.sendMessage(fnResponse); // 2라운드
                }
            }

            String finalText = response.text();
            if (finalText == null) finalText = "";
            return ResponseEntity.ok(new ChatResponseDto(finalText));

        } catch (Exception e) {
            log.error("AI Chat 처리 중 오류", e);
            return ResponseEntity.internalServerError()
                    .body(new ChatResponseDto("죄송합니다. 챗봇 처리 중 오류가 발생했습니다."));
        }
    }
}