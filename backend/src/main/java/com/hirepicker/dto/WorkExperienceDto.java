package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.WorkExperience;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// 경력 DTO (간단 매핑)
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

    // 엔티티 변환(연관 personalUser는 서비스에서 주입)
    public WorkExperience toEntity(PersonalUser user) {
        // 생성자/빌더 없이 필드 주입: JPA는 기본 생성자 필요, 여기서는 서비스에서 세팅 권장
        WorkExperience we = new WorkExperience();
        // 안전한 필드 설정(간단 세터 없이 리플렉션 대신 서비스에서 엔티티 매핑 권장)
        // 본 DTO는 입력 검증·전달 용도로 유지
        return we;
    }
}

