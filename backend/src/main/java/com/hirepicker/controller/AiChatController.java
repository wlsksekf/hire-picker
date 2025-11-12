package com.hirepicker.controller;

import com.google.genai.Chat;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.FunctionCall;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Tool;
import com.hirepicker.dto.chatbot.ChatRequestDto;
import com.hirepicker.dto.chatbot.ChatResponseDto;
import com.hirepicker.service.ChatbotToolService;
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
import java.util.UUID; // UUID import 추가
import java.util.concurrent.ConcurrentHashMap; // ConcurrentHashMap import 추가

@Tag(name = "AI 챗봇", description = "AI 챗봇 (Function Calling) 관련 API")
@RestController
@RequestMapping("/api/v1/ai-chat") // Function Calling 전용
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    private final ChatbotToolService chatbotToolService;
    private final Client genaiClient;

    // 챗봇 세션을 저장하는 맵 (세션 ID -> Chat 객체)
    private final Map<String, Chat> chatSessions = new ConcurrentHashMap<>();

    @Operation(summary = "AI 챗봇 대화", description = "채용공고 및 기업 정보 검색 기능이 포함된 AI 챗봇과 대화합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "대화 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<ChatResponseDto> handleChat(
            @Parameter(description = "챗봇 요청 (프롬프트 및 세션 ID)", required = true) @RequestBody ChatRequestDto request) {

        try {
            // 세션 ID가 없으면 새로 생성
            String sessionId = Optional.ofNullable(request.sessionId())
                    .orElseGet(() -> UUID.randomUUID().toString());

            // 기존 세션 가져오기 또는 새로운 세션 생성
            Chat chat = chatSessions.computeIfAbsent(sessionId, k -> {
                Tool searchJobPostingsTool = chatbotToolService.getSearchJobPostingsTool();
                Tool searchCompanyInfoTool = chatbotToolService.getSearchCompanyInfoTool(); // 기업 정보 검색 Tool 가져오기
                GenerateContentConfig config = GenerateContentConfig.builder()
                        .tools(List.of(searchJobPostingsTool, searchCompanyInfoTool)) // 두 가지 Tool 모두 등록
                        .build();
                return genaiClient.chats.create("gemini-2.5-flash", config);
            });

            String prompt = request.prompt() == null ? "" : request.prompt();
            GenerateContentResponse response = chat.sendMessage(
                    """
                                        너는 Hire-Picker 사이트의 채용 공고 및 기업 정보를 안내하는 챗봇이야. 아래 지침을 따라서 사용자의 질문에 답변해줘.

                                        1.  **대화의 맥락을 완벽하게 기억하고 활용해줘.** 사용자가 이전에 했던 말을 반드시 기억하고, 새로운 질문이나 정보가 들어오면 기존 정보와 조합해서 답변해야 해. 절대로 이전 맥락을 잊으면 안 돼.
                                        2.  **부족한 정보는 추론하고, 그래도 부족하면 질문해줘.** 만약 도구 사용에 필요한 정보가 부족하면, 사용자에게 바로 되묻지 말고 이전 대화에서 관련된 정보를 먼저 찾아봐. 그래도 정보가 부족할 때만 질문해야 해.
                                        3.  **적절한 도구를 정확한 인자와 함께 사용해줘.** 사용자의 질문 의도를 파악해서 'searchJobPostings' 또는 'searchCompanyInfo' 도구를 사용해줘. 간단한 대화에는 도구를 사용하지 마.
                                        4.  **'모든 지역'은 특별하게 처리해줘.** 사용자가 '모든 지역'을 언급하면, 지역 필터링 없이 전국을 대상으로 검색해야 해. location 인자에는 "모든 지역"이라고 넘겨주면 돼.

                                        **대화 예시:**
                                        - 사용자: 최신 공고가 뭐야?
                                        - 너: 어떤 회사나 직무에 대한 공고를 찾아드릴까요? 지역도 알려주시면 더 정확하게 찾아드릴 수 있어요.
                                        - 사용자: 개발자 쪽, 수도권
                                        - 너: (searchJobPostings(keyword="개발자", location="수도권")을 호출하여 결과를 바탕으로 답변)

                                        - 사용자: 기계 관련 공고는?
                                        - 너: 어느 지역의 기계 관련 공고를 찾아드릴까요?
                                        - 사용자: 모든 지역
                                        - 너: (searchJobPostings(keyword="기계", location="모든 지역")을 호출하여 결과를 바탕으로 답변)

                                        ---
                                        이제 사용자의 질문에 답변해줘.
                                        - 사용자의 질문: %s

                    """.formatted(prompt)
            );

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
                } else if ("searchCompanyInfo".equals(fnName)) { // 기업 정보 검색 처리
                    Optional<Map<String, Object>> argsOpt = fc.args();
                    Map<String, Object> args = (argsOpt != null) ? argsOpt.orElse(Map.of()) : Map.of();

                    String companyName = String.valueOf(args.getOrDefault("companyName", ""));

                    List<Map<String, String>> dbResults =
                            chatbotToolService.searchCompanyInfo(companyName);

                    Content fnResponse = chatbotToolService.createFunctionResponse(fnName, dbResults);
                    response = chat.sendMessage(fnResponse); // 2라운드
                }
            }

            String finalText = response.text();
            if (finalText == null) finalText = "";
            // 응답에 sessionId 포함
            return ResponseEntity.ok(new ChatResponseDto(finalText, sessionId));

        } catch (Exception e) {
            log.error("AI Chat 처리 중 오류", e);
            return ResponseEntity.internalServerError()
                    .body(new ChatResponseDto("죄송합니다. 챗봇 처리 중 오류가 발생했습니다.", null)); // 오류 시 sessionId는 null
        }
    }
}
