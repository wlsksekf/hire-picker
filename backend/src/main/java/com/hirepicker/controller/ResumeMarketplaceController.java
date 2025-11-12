package com.hirepicker.controller;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.ResumeMarketItemDto;
import com.hirepicker.dto.ResumePurchaseResponse;
import com.hirepicker.service.ResumeMarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
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

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "이력서 거래소")
public class ResumeMarketplaceController {

    private final ResumeMarketplaceService resumeMarketplaceService;

    @Operation(summary = "공개 이력서 거래 목록 조회")
    @GetMapping("/resumes/marketplace")
    public ResponseEntity<List<ResumeMarketItemDto>> getMarketplace(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        if (userDetails.getUserType() != com.hirepicker.entity.UserType.PERSONAL) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(resumeMarketplaceService.getMarketplaceResumes(userDetails));
    }

    @Operation(summary = "이력서 구매")
    @PostMapping("/resumes/{resumeId}/purchase")
    public ResponseEntity<ResumePurchaseResponse> purchaseResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long resumeId) {
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

