package com.hirepicker.dto;

import java.time.LocalDateTime;

import com.hirepicker.entity.Resume;

import lombok.AllArgsConstructor;
import lombok.Getter;

// 이력서 목록 응답용 DTO(필요 필드만 간단 노출)
@Getter
@AllArgsConstructor
public class ResumeListItemDto {
    private final Long id; // 이력서 PK
    private final String title; // 제목
    private final String status; // 공개 상태(문자열)
    private final boolean isDefault; // 기본 이력서 여부
    private final String imageUrl; // 이미지 URL
    // private final Long expIdx; // 연결된 경력 PK(옵션)
    private final LocalDateTime modifiedDate; // 최종 수정일시

    // 엔티티 -> DTO 변환 편의 메서드
    public static ResumeListItemDto from(Resume resume) {
        // WorkExperience we = resume.getWorkExperience(); // 연결 경력
        return new ResumeListItemDto(
                resume.getId(),
                resume.getTitle(),
                resume.getStatus() != null ? resume.getStatus().name() : null,
                resume.isDefault(),
                resume.getImageUrl(),
                // we != null ? we.getId() : null,
                resume.getModifiedDate());
    }
}
