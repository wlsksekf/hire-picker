package com.hirepicker.dto;

import com.hirepicker.entity.Resume;
import lombok.Getter;

// 이력서 저장 후 응답으로 보낼 DTO
@Getter
public class ResumeResponseDto {

    private final Long resumeId;
    private final String title;
    private final String message;

    public ResumeResponseDto(Resume resume) {
        this.resumeId = resume.getId();
        this.title = resume.getTitle();
        this.message = "이력서가 성공적으로 저장되었습니다.";
    }
}
