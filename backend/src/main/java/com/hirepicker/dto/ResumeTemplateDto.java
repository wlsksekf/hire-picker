package com.hirepicker.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 이력서 자동채움용 묶음 DTO (학력/경력/병역)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ResumeTemplateDto {
    // 저장된 학력 요약 목록
    private List<AcademicAbilityViewDto> academics;
    // 저장된 경력 목록
    private List<WorkExperienceDto> experiences;
    // 저장된 병역 정보(없으면 null)
    private MilitaryServiceDto military;
}

