package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

// 자격증 매핑 업데이트 요청 DTO
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CertificationUpdateRequestDto {
    @JsonProperty("resume_idx")
    private Long resumeIdx;              // 대상 이력서 PK

    @JsonProperty("certifications")
    private List<Item> certifications;   // 저장할 자격증 목록

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        @JsonProperty("cert_idx")
        private Long certIdx;            // 기존 자격증 ID (선택)

        @JsonProperty("cert_name")
        private String certName;         // 신규 자격증명 (선택)

        @JsonProperty("score")
        private String score;            // 점수/등급 (선택)
    }
}
