package com.hirepicker.controller;

import com.hirepicker.dto.ai.FullResumeDraftDto;
import com.hirepicker.dto.ai.ResumeDraftRequestDto;
import com.hirepicker.service.AiResumeService;
import com.hirepicker.service.S3UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Tag(name = "AI", description = "AI 관련 API")
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiResumeService aiResumeService;
    private final S3UploadService s3UploadService;

    @Operation(summary = "AI 이력서 초안 생성/수정", description = "AI를 사용하여 이력서 초안 전체를 생성하거나 기존 초안을 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "성공적으로 이력서 초안이 생성/수정되었습니다."),
        @ApiResponse(responseCode = "400", description = "잘못된 요청입니다."),
        @ApiResponse(responseCode = "500", description = "서버 오류입니다.")
    })
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

    @Operation(summary = "S3에 이미지 업로드", description = "이미지를 S3에 업로드하고 업로드된 이미지의 URL을 반환합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "이미지 업로드 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@Parameter(description = "업로드할 이미지 파일") @RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = s3UploadService.uploadFile(file, "profile-images"); // "profile-images" 디렉토리에 저장
        return ResponseEntity.ok(imageUrl);
    }
}
