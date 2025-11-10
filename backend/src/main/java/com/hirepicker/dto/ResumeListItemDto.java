package com.hirepicker.dto;

import com.hirepicker.entity.Resume;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

// 이력서 목록 응답용 DTO(주요 필드만 간단 추출)
@Getter
@AllArgsConstructor
public class ResumeListItemDto {
    private final Long id;           // 이력서 PK
    private final String title;      // 제목
    private final String status;     // 공개 상태(문자열)
    private final int creditCost;    // 열람 크레딧 비용
    private final String imageUrl;   // 이미지 URL
    private final Long expIdx;       // 연결된 경력 PK(옵션)
    private final LocalDateTime modifiedDate; // 최종 수정일시

    // 엔티티 -> DTO 변환용 메서드
    public static ResumeListItemDto from(Resume resume, Long expIdx) { return new ResumeListItemDto( resume.getId(), resume.getTitle(), resume.getStatus() != null ? resume.getStatus().name() : null, resume.getCreditCost(), resume.getImageUrl(), expIdx, resume.getModifiedDate() ); }
}