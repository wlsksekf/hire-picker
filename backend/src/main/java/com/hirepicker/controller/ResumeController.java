package com.hirepicker.controller;

import com.hirepicker.dto.ResumeDto;
import com.hirepicker.dto.ResumeResponseDto;
import com.hirepicker.entity.Resume;
import com.hirepicker.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@Tag(name = "이력서", description = "이력서 관리 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j // Slf4j 로깅 어노테이션 추가
public class ResumeController {

    private final ResumeService resumeService;

    @Operation(summary = "이력서 저장", description = "새로운 이력서를 데이터베이스에 저장합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "이력서가 성공적으로 생성되었습니다."),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터입니다."),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없습니다.")
    })
    @PostMapping("/resume")
    public ResponseEntity<ResumeResponseDto> createResume(@RequestBody ResumeDto resumeDto) {
        String resumeTitle = resumeDto.getTitle() != null ? resumeDto.getTitle() : "제목 없음";
        log.info("이력서 저장 요청 수신: {}", resumeTitle); // title 사용 또는 기본값
        
        // pUserIdx 값 확인을 위한 로그 추가
        if (resumeDto.getPUserIdx() == null) {
            log.warn("ResumeDto에 pUserIdx가 null입니다!");
        } else {
            log.info("수신된 pUserIdx: {}", resumeDto.getPUserIdx());
        }

        try {
            ResumeResponseDto responseDto = resumeService.saveResume(resumeDto);
            log.info("이력서 저장 성공: {}", responseDto.getResumeId()); // 로그 추가
            // 생성된 리소스의 URI를 반환 (성공적인 POST 요청에 대한 RESTful 표준)
            URI location = URI.create("/api/resume/" + responseDto.getResumeId());
            return ResponseEntity.created(location).body(responseDto);
        } catch (IllegalArgumentException e) {
            log.error("이력서 저장 실패: 사용자를 찾을 수 없음", e); // 로그 추가
            // 사용자를 찾을 수 없는 경우
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            log.error("이력서 저장 실패: 알 수 없는 오류", e);
            // 기타 예외 처리
            return ResponseEntity.badRequest().build();
        }
    }
}
