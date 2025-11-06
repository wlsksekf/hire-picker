package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.WorkExperience;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// 경력 DTO (간단 전달용)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperienceDto {
    @JsonProperty("p_user_idx")
    private Long pUserIdx;           // 개인회원 PK
    private String companyName;      // 회사명
    private String department;       // 부서
    private String position;         // 직책
    private LocalDate hireDate;      // 입사일
    private LocalDate resignDate;    // 퇴사일
    private String jobDescription;   // 업무 설명
    private String mainDuties;       // 주요 직무

    // 엔티티 변환(필요 시 PersonalUser를 외부에서 주입)
    public WorkExperience toEntity(PersonalUser user) {
        // 단순 DTO이므로 엔티티 매핑은 별도 구성 권장
        WorkExperience we = new WorkExperience();
        return we;
    }
}

