package com.hirepicker.controller;

import com.hirepicker.dto.ai.FullResumeDraftDto;
import com.hirepicker.dto.ai.ResumeDraftRequestDto;
import com.hirepicker.service.AiResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// AI 관련 API 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiResumeService aiResumeService;

    /**
     * AI를 사용하여 이력서 초안 전체를 생성하거나 기존 초안을 수정합니다.
     *
     * @param requestDto 사용자 정보, 채용 공고, 그리고 선택적으로 기존 이력서 초안이 담긴 요청 DTO
     * @return 생성 또는 수정된 이력서 초안 DTO를 포함하는 ResponseEntity
     */
    @PostMapping("/resume-draft")
    public ResponseEntity<FullResumeDraftDto> generateResumeDraft(@RequestBody ResumeDraftRequestDto requestDto) {
        // AiResumeService를 호출하여 이력서 초안 생성 또는 수정
        FullResumeDraftDto resumeDraft = aiResumeService.generateFullResumeDraft(
                requestDto.userData(),
                requestDto.jobPostingData(),
                requestDto.resumeDraft() // 기존 이력서 초안 전달
        );
        // 생성된 초안을 OK 상태와 함께 반환
        return ResponseEntity.ok(resumeDraft);
    }
}
