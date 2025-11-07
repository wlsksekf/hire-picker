package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Resume;
import com.hirepicker.entity.ResumeStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

// 이력서 요청/응답용 DTO (DB 명세 반영)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // 정의되지 않은 필드는 무시
public class ResumeDto {

    // resumes 테이블과 직접 매핑되는 필드
    @NotBlank(message = "제목은 필수 입력 항목입니다.")
    @Size(max = 70, message = "제목은 최대 70자까지 입력 가능합니다.")
    private String title;               // 제목(최대 70자)

    @Size(max = 2000, message = "성장 배경은 최대 2000자까지 입력 가능합니다.") // @Lob 필드이므로 적절한 최대 길이 설정
    private String selfGrowth;          // 성장 배경

    @Size(max = 2000, message = "성격/강점은 최대 2000자까지 입력 가능합니다.")
    private String selfStrengths;       // 성격/강점

    @Size(max = 2000, message = "지원 동기는 최대 2000자까지 입력 가능합니다.")
    private String selfMotivation;      // 지원 동기

    @Size(max = 2000, message = "포부는 최대 2000자까지 입력 가능합니다.")
    private String selfAspirations;     // 포부

    private String imageUrl;            // 이미지 URL

    @Size(max = 200, message = "자격요약은 최대 200자까지 입력 가능합니다.")
    private String cert;                // 자격요약(200)

    @NotNull(message = "기본 이력서 여부는 필수 입력 항목입니다.")
    private Boolean isDefault;          // 기본 이력서 여부

    private String status;              // 공개 상태(문자열: PUBLIC/PRIVATE)

    private Long expIdx;                // 선택 경력 PK(선택)

    @JsonProperty("p_user_idx")
    @NotNull(message = "개인회원 PK는 필수 입력 항목입니다.")
    private Long pUserIdx;              // 개인회원 PK

    // 추가 본문: 학력/경력/병역/성별 (선택 입력)
    @Valid // 리스트 내부 객체 유효성 검사
    private List<AcademicAbilityDto> academicAbilities; // 학력 목록

    @Valid // 리스트 내부 객체 유효성 검사
    private List<WorkExperienceDto> workExperiences;    // 경력 목록

    @Valid // 객체 유효성 검사
    private MilitaryServiceDto militaryService;         // 병역 정보

    private String gender;                              // 성별(문자열: MALE/FEMALE)

    // DTO -> 엔티티로 변환(경력 연결은 별도 처리)
    public Resume toEntity(PersonalUser personalUser, String imageUrl) {
        // 상태 문자열을 enum으로 변환 (실패 시 null 유지)
        ResumeStatus statusEnum = null;
        if (status != null) {
            try { statusEnum = ResumeStatus.valueOf(status); } catch (Exception ignored) {}
        }

        return Resume.builder()
                .personalUser(personalUser)
                .title(title != null ? title : personalUser.getName() + "의 이력서")
                .selfGrowth(selfGrowth)
                .selfStrengths(selfStrengths)
                .selfMotivation(selfMotivation)
                .selfAspirations(selfAspirations)
                .imageUrl(imageUrl)
                .isDefault(isDefault != null ? isDefault : false)
                .status(statusEnum)
                .cert(cert)
                .cancel(null) // cancel 기본 null 유지
                .build();
    }
}