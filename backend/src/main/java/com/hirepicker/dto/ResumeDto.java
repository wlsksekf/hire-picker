package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Resume;
import com.hirepicker.entity.ResumeStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 이력서 데이터 전송 객체 (DB 명세 반영)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // 정의되지 않은 필드 무시
public class ResumeDto {

    // resumes 테이블과 직접 연관된 필드들
    private String title;               // 제목(70자)
    private String selfGrowth;          // 성장 배경
    private String selfStrengths;       // 성격
    private String selfMotivation;      // 지원 동기
    private String selfAspirations;     // 포부
    private String imageUrl;            // 이미지 URL
    private String cert;                // 자격증 요약(200)
    private Boolean isDefault;          // 기본 이력서 여부
    private String status;              // 공개 상태(문자열: PUBLIC/PRIVATE)
    private Long expIdx;                // 연결할 경력 PK(선택)

    @JsonProperty("p_user_idx")
    private Long pUserIdx;              // 개인회원 PK

    // DTO를 엔티티로 변환(경력 연결은 서비스에서 처리)
    public Resume toEntity(PersonalUser personalUser, String imageUrl) {
        // 상태 문자열을 enum으로 안전 변환(널/오류 시 기본값 유지)
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
                .isDefault(isDefault)
                .status(statusEnum)
                .cert(cert)
                .cancel(null) // cancel은 기본 null 유지
                .workExperience(null) // expIdx는 서비스에서 연결
                .build();
    }
}

