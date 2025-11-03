package com.hirepicker.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Resume;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 이력서 데이터 전송 객체 (DB 명세 기반으로 재수정)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // 정의되지 않은 필드는 무시
public class ResumeDto {

    // resumes 테이블과 직접 관련된 필드들
    private String title;
    private String selfGrowth;
    private String selfStrengths;
    private String selfMotivation;
    private String selfAspirations;
    private String imageUrl;

    @JsonProperty("p_user_idx")
    private Long pUserIdx;

    // DTO를 엔티티로 변환하는 메소드
    public Resume toEntity(PersonalUser personalUser) {
        return Resume.builder()
                .personalUser(personalUser)
                .title(title != null ? title : personalUser.getName() + "님의 이력서") // title이 없으면 기본값 설정
                .selfGrowth(selfGrowth)
                .selfStrengths(selfStrengths)
                .selfMotivation(selfMotivation)
                .selfAspirations(selfAspirations)
                .imageUrl(imageUrl)
                .build();
    }
}
