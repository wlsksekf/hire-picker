// package com.hirepicker.service;

// import com.hirepicker.dto.ai.FullResumeDraftDto;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.stereotype.Service;

// /**
//  * AI 기반 자기소개서 초안 생성 서비스
//  * - Spring AI (ChatClient 추상화) 기반
//  * - 사용자가 제공한 키워드로 전문적인 자기소개서 초안을 생성
//  */
// @Slf4j
// @Service
// @RequiredArgsConstructor
// public class AiResumeService {

//     // [수정] 특정 구현 클래스 대신 ChatClient 인터페이스를 사용
//     private final ChatClient chatClient;
//     // private final CreditService creditService; // 결제/크레딧 연동 시 주입

//     /**
//      * 사용자 키워드를 기반으로 AI 자기소개서 초안 생성
//      * @param userKeywords 사용자 제공 키워드 (예: "성실함, 리더십, 협업능력, 개발자")
//      * @param userId 사용자 ID (추후 크레딧 차감용)
//      * @return 생성된 자기소개서 초안 DTO
//      */
//     public FullResumeDraftDto generateFullDraft(String userKeywords, Long userId) {

//         // (선택) 크레딧 차감 로직 예시
//         // creditService.useCredits(userId, 10, "AI 자기소개서 초안 생성");

//         // 🧠 시스템 프롬프트
//         String systemMessageTemplate = """
//             당신은 취업 플랫폼 'hirepicker'의 전문 이력서 코치입니다.
//             사용자가 제공한 핵심 키워드를 바탕으로 다음 네 가지 항목을
//             전문적이고 설득력 있게 한국어로 작성하세요.

//             [작성 항목]
//             1. 성장과정 (growthProcess)
//             2. 업무 관련 역량 (jobCompetencies)
//             3. 성격 장단점 (prosAndCons)
//             4. 입사 후 포부 (aspirations)

//             각 항목은 300~500자 내외로 작성해야 합니다.
//             반드시 아래 JSON 형식으로만 응답하세요:
//             {format}
//             """;

//         try {
//             // [수정] ChatClient의 빌더 패턴과 .entity()를 사용하여 코드를 대폭 단순화
//             log.info("AI 자기소개서 생성을 요청합니다. userId: {}, keywords: {}", userId, userKeywords);

//             return chatClient.prompt()
//                     .system(p -> p.text(systemMessageTemplate).param("format", "json"))
//                     .user("다음은 사용자의 핵심 키워드입니다: " + userKeywords)
//                     .call()
//                     .entity(FullResumeDraftDto.class);

//         } catch (Exception e) {
//             log.error("AI 자기소개서 생성 중 오류 발생: {}", e.getMessage(), e);
//             throw new RuntimeException("AI 자기소개서 생성 중 오류가 발생했습니다.", e);
//         }
//     }
// }