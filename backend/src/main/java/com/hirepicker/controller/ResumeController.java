package com.hirepicker.controller;

import com.hirepicker.dto.ResumeDto;
import com.hirepicker.dto.ResumeResponseDto;
import com.hirepicker.dto.ResumeTemplateDto; // 자동채움 응답 DTO
import com.hirepicker.config.security.CustomUserDetails; // 인증 사용자 주입
import com.hirepicker.service.ResumeService;
import com.hirepicker.service.S3UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid; // @Valid 임포트
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // 인증 Principal 주입
import org.springframework.validation.BindingResult; // BindingResult 임포트
import org.springframework.validation.FieldError; // FieldError 임포트
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "이력서", description = "이력서 관리 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j // Slf4j 로깅 어노테이션 추가
public class ResumeController {

    private final ResumeService resumeService;
    private final S3UploadService s3UploadService;

    @Operation(summary = "이력서 저장", description = "새로운 이력서를 데이터베이스에 저장합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "이력서가 성공적으로 생성되었습니다."),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터입니다."),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없습니다.")
    })
    @PostMapping("/resume")
    public ResponseEntity<?> createResume(@RequestPart("resumeDto") @Valid ResumeDto resumeDto, // @Valid 추가
                                                        BindingResult bindingResult, // BindingResult 추가
                                                        @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        // 유효성 검사 실패 시
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            log.error("이력서 저장 실패: 유효성 검사 오류 - {}", errors);
            return ResponseEntity.badRequest().body(errors); // 400 Bad Request와 오류 메시지 반환
        }

        String resumeTitle = resumeDto.getTitle() != null ? resumeDto.getTitle() : "제목 없음";
        log.info("이력서 저장 요청 수신: {}", resumeTitle);

        if (imageFile != null && !imageFile.isEmpty()) {
            log.info("첨부된 이미지 파일: {}", imageFile.getOriginalFilename());
        }

        try {
            ResumeResponseDto responseDto = resumeService.saveResume(resumeDto, imageFile);
            log.info("이력서 저장 성공: {}", responseDto.getResumeId());
            URI location = URI.create("/api/resume/" + responseDto.getResumeId());
            return ResponseEntity.created(location).body(responseDto);
        } catch (IllegalArgumentException e) {
            log.error("이력서 저장 실패: 사용자를 찾을 수 없음", e);
            return ResponseEntity.status(404).body(e.getMessage()); // 404 Not Found와 오류 메시지 반환
        } catch (Exception e) {
            log.error("이력서 저장 실패: 알 수 없는 오류", e);
            return ResponseEntity.badRequest().body("알 수 없는 오류가 발생했습니다."); // 400 Bad Request와 일반 오류 메시지 반환
        }
    }

    @Operation(summary = "이력서 목록", description = "로그인 사용자의 이력서 목록을 반환합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping("/resumes")
    public ResponseEntity<List<com.hirepicker.dto.ResumeListItemDto>> getMyResumes() {
        // 서비스로 위임해 목록 조회
        List<com.hirepicker.dto.ResumeListItemDto> list = resumeService.getMyResumes();
        return ResponseEntity.ok(list);
    }

    @Operation(summary = "이력서 상세", description = "이력서 ID로 상세 정보를 반환합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "404", description = "존재하지 않음")
    })
    @GetMapping("/resume/{id}")
    public ResponseEntity<com.hirepicker.dto.ResumeDetailDto> getResumeDetail(@PathVariable("id") Long id) {
        try {
            com.hirepicker.dto.ResumeDetailDto dto = resumeService.getResumeDetail(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).build(); // 404 Not Found와 오류 메시지 반환
        }
    }

    @Operation(summary = "이력서 자동채움 데이터", description = "사용자 저장 학력/경력/병역을 한 번에 반환합니다.")
    @GetMapping("/resumes/template")
    public ResponseEntity<ResumeTemplateDto> getResumeTemplate(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // 인증되지 않은 경우 401 반환
        if (userDetails == null) return ResponseEntity.status(401).build();
        // 사용자 id 기반으로 자동채움 데이터 조회
        ResumeTemplateDto body = resumeService.getResumeTemplate(userDetails.getId());
        return ResponseEntity.ok(body);
    }

    @Operation(summary = "이미지 base64 변환", description = "S3 이미지 URL을 base64로 변환하여 반환합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "변환 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/resume/image/base64")
    public ResponseEntity<Map<String, String>> getImageAsBase64(@RequestParam("url") String imageUrl) {
        try {
            String base64 = s3UploadService.getImageAsBase64(imageUrl);
            Map<String, String> response = new HashMap<>();
            response.put("base64", base64);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("이미지 base64 변환 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}
