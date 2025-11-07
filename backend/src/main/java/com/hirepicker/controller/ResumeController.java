// package com.hirepicker.controller;

// import com.hirepicker.dto.ResumeDto;
// import com.hirepicker.dto.ResumeResponseDto;
// import com.hirepicker.service.ResumeService;
// import io.swagger.v3.oas.annotations.Operation;
// import io.swagger.v3.oas.annotations.responses.ApiResponse;
// import io.swagger.v3.oas.annotations.responses.ApiResponses;
// import io.swagger.v3.oas.annotations.tags.Tag;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestPart;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile;

// import java.net.URI;
// import java.util.List;

// @Tag(name = "이력서", description = "이력서 관리 API")
// @RestController
// @RequestMapping("/api")
// @RequiredArgsConstructor
// @Slf4j // Slf4j 로깅 어노테이션 추가
// public class ResumeController {

// private final ResumeService resumeService;

// @Operation(summary = "이력서 저장", description = "새로운 이력서를 데이터베이스에 저장합니다.")
// @ApiResponses(value = {
// @ApiResponse(responseCode = "201", description = "이력서가 성공적으로 생성되었습니다."),
// @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터입니다."),
// @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없습니다.")
// })
// @PostMapping("/resume")
// public ResponseEntity<ResumeResponseDto>
// createResume(@RequestPart("resumeDto") ResumeDto resumeDto,
// @RequestPart(value = "imageFile", required = false) MultipartFile imageFile)
// {
// String resumeTitle = resumeDto.getTitle() != null ? resumeDto.getTitle() :
// "제목 없음";
// log.info("이력서 저장 요청 수신: {}", resumeTitle);

// if (imageFile != null && !imageFile.isEmpty()) {
// log.info("첨부된 이미지 파일: {}", imageFile.getOriginalFilename());
// }

// try {
// ResumeResponseDto responseDto = resumeService.saveResume(resumeDto,
// imageFile);
// log.info("이력서 저장 성공: {}", responseDto.getResumeId());
// URI location = URI.create("/api/resume/" + responseDto.getResumeId());
// return ResponseEntity.created(location).body(responseDto);
// } catch (IllegalArgumentException e) {
// log.error("이력서 저장 실패: 사용자를 찾을 수 없음", e);
// return ResponseEntity.status(404).build();
// } catch (Exception e) {
// log.error("이력서 저장 실패: 알 수 없는 오류", e);
// return ResponseEntity.badRequest().build();
// }
// }

// @Operation(summary = "이력서 목록", description = "로그인 사용자의 이력서 목록을 반환합니다.")
// @ApiResponses(value = {
// @ApiResponse(responseCode = "200", description = "조회 성공"),
// @ApiResponse(responseCode = "401", description = "인증 필요")
// })
// @GetMapping("/resumes")
// public ResponseEntity<List<com.hirepicker.dto.ResumeListItemDto>>
// getMyResumes() {
// // 서비스로 위임해 목록 조회
// List<com.hirepicker.dto.ResumeListItemDto> list =
// resumeService.getMyResumes();
// return ResponseEntity.ok(list);
// }

// @Operation(summary = "이력서 상세", description = "이력서 ID로 상세 정보를 반환합니다.")
// @ApiResponses(value = {
// @ApiResponse(responseCode = "200", description = "조회 성공"),
// @ApiResponse(responseCode = "401", description = "인증 필요"),
// @ApiResponse(responseCode = "404", description = "존재하지 않음")
// })
// @GetMapping("/resume/{id}")
// public ResponseEntity<com.hirepicker.dto.ResumeDetailDto>
// getResumeDetail(@PathVariable("id") Long id) {
// try {
// com.hirepicker.dto.ResumeDetailDto dto = resumeService.getResumeDetail(id);
// return ResponseEntity.ok(dto);
// } catch (IllegalArgumentException e) {
// return ResponseEntity.status(404).build();
// }
// }
// }
