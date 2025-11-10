package com.hirepicker.controller;

import com.hirepicker.repository.CertificationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.HashMap; // 값 타입을 명시적으로 Object로 고정하기 위해 사용

@Tag(name = "자격증", description = "자격증 검색 API")
@RestController
@RequestMapping("/api/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationRepository certificationRepository;

    // 자격증 자동완성: 키워드 부분일치 상위 10건
    @Operation(summary = "자격증 자동완성", description = "keyword로 자격증명을 부분 검색하여 상위 10건 반환")
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(@RequestParam("keyword") String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.ok(List.of());
        }
        var list = certificationRepository
                .findTop10ByCertNameContainingIgnoreCaseOrderByCertNameAsc(keyword.trim())
                .stream()
                .map(c -> {
                    // 타입 추론 교차타입 문제를 피하기 위해 명시적 Map 생성
                    Map<String, Object> m = new HashMap<>();
                    m.put("certIdx", c.getCertIdx());
                    m.put("certName", c.getCertName());
                    return m;
                })
                .toList();
        return ResponseEntity.ok(list);
    }
}
