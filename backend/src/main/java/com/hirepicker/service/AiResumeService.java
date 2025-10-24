package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AiResumeService {

    private static final Long AI_RESUME_COST = 100L; // AI 이력서 생성 비용

    private final ChatClient chatClient;
    private final CreditService creditService; // CreditService 주입

    // 생성자 주입.
    public AiResumeService(ChatClient.Builder chatClientBuilder, CreditService creditService) {
        this.chatClient = chatClientBuilder.build();
        this.creditService = creditService;
    }

    /**
     * 키워드를 기반으로 이력서 경력 사항 문장을 생성하고 크레딧을 차감합니다.
     * @param keywords 사용자가 입력한 키워드
     * @param userDetails 현재 인증된 사용자 정보
     * @return AI가 생성한 이력서 문장 (String)
     */
    public String generateResumeSection(String keywords, CustomUserDetails userDetails) {

        // 1. 크레딧 차감 로직 호출
        creditService.useCredits(userDetails, "AI 이력서 생성", AI_RESUME_COST);

        // 2. AI 프롬프트 생성 및 호출 (기존 로직)
        String promptTemplate = """
            너는 'hirepicker'의 전문 이력서 컨설턴트 AI야.
            주어진 [키워드]를 바탕으로, 구인구직 사이트에 등록할 '경력 기술서'에 들어갈 3개의 핵심 불렛 포인트를 작성해줘.

            [규칙]
            1. 각 불렛 포인트는 2줄을 넘지 않게 요약해.
            2. 성과(Result)가 드러나는 **STAR 기법** (Situation, Task, Action, Result)으로 작성해.
            3. "저는", "~했습니다" 같은 1인칭 서술어 대신, "~함", "~했음", "~ 달성" 같은 개조식으로 명료하게 작성해.

            [키워드]: {keywords}

            [예시]
            - Spring Boot와 JWT를 활용하여, 월 1만 명이 사용하는 서비스의 인증 시스템을 구축함 (보안성 20% 향상).
            - React와 Zustand를 사용하여 'hirepicker' 프로젝트의 프론트엔드 상태 관리를 구현하고, 로딩 속도를 1.5초 단축함.

            이제, 위 규칙에 맞춰서 작성해줘:
            """;

        // ChatClient의 fluent API를 사용하여 AI 호출
        return chatClient.prompt()
                .user(p -> p.text(promptTemplate).param("keywords", keywords))
                .call()
                .content();
    }
}
