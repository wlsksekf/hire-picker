package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.WorkExperience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @NotNull(message = "개인회원 PK는 필수 입력 항목입니다.")
    private Long pUserIdx;           // 개인회원 PK

    @NotBlank(message = "회사명은 필수 입력 항목입니다.")
    @Size(max = 100, message = "회사명은 최대 100자까지 입력 가능합니다.")
    private String companyName;      // 회사명

    @Size(max = 100, message = "부서는 최대 100자까지 입력 가능합니다.")
    private String department;       // 부서

    @Size(max = 100, message = "직책은 최대 100자까지 입력 가능합니다.")
    private String position;         // 직책

    @NotNull(message = "입사일은 필수 입력 항목입니다.")
    private LocalDate hireDate;      // 입사일

    private LocalDate resignDate;    // 퇴사일

    @Size(max = 2000, message = "업무 설명은 최대 2000자까지 입력 가능합니다.")
    private String jobDescription;   // 업무 설명

    @Size(max = 20, message = "주요 직무는 최대 20자까지 입력 가능합니다.")
    private String mainDuties;       // 주요 직무

    // 엔티티 변환(필요 시 PersonalUser를 외부에서 주입)
    public WorkExperience toEntity(PersonalUser user) {
        return WorkExperience.builder()
                .personalUser(user)
                .companyName(this.companyName)
                .department(this.department)
                .position(this.position)
                .hireDate(this.hireDate)
                .resignDate(this.resignDate)
                .jobDescription(this.jobDescription)
                .mainDuties(this.mainDuties)
                .build();
    }
}
