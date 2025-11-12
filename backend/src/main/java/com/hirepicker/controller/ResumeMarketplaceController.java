package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.ResumeMarketItemDto;
import com.hirepicker.dto.ResumePurchaseResponse;
import com.hirepicker.service.ResumeMarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "이력서 거래소", description = "이력서 거래소 관련 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ResumeMarketplaceController {

    private final ResumeMarketplaceService resumeMarketplaceService;

    @Operation(summary = "공개 이력서 거래 목록 조회", description = "공개된 이력서 목록을 조회합니다. 개인회원만 조회 가능합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "403", description = "개인회원만 접근 가능")
    })
    @GetMapping("/resumes/marketplace")
    public ResponseEntity<List<ResumeMarketItemDto>> getMarketplace(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        if (userDetails.getUserType() != com.hirepicker.entity.UserType.PERSONAL) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(resumeMarketplaceService.getMarketplaceResumes(userDetails));
    }

    @Operation(summary = "이력서 구매", description = "선택한 이력서를 크레딧으로 구매합니다. 개인회원만 구매 가능합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "구매 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "개인회원만 접근 가능"),
        @ApiResponse(responseCode = "400", description = "크레딧 부족 또는 이미 구매한 이력서")
    })
    @PostMapping("/resumes/{resumeId}/purchase")
    public ResponseEntity<ResumePurchaseResponse> purchaseResume(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails,
            @Parameter(description = "구매할 이력서 ID", required = true) @PathVariable Long resumeId) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        if (userDetails.getUserType() != com.hirepicker.entity.UserType.PERSONAL) {
            return ResponseEntity.status(403).build();
        }
        ResumePurchaseResponse response = resumeMarketplaceService.purchaseResume(resumeId, userDetails);
        return ResponseEntity.ok(response);
    }
}

