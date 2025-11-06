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

    @JsonProperty("cert_idx_list")
    private List<Long> certIdxList;      // 자격증 ID 목록(우선 적용)

    @JsonProperty("cert_name_list")
    private List<String> certNameList;   // 자격증 이름 목록(없으면 마스터 생성)
}

