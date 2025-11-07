package com.hirepicker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 이력서-선택경력 연결(chosen_exp)
@Entity
@Table(name = "chosen_exp")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChosenExp {

    @EmbeddedId
    private ChosenExpId id; // (resume_idx, exp_idx)

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("resumeId")
    @JoinColumn(name = "resume_idx", nullable = false)
    private Resume resume; // 이력서

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("expId")
    @JoinColumn(name = "exp_idx", nullable = false)
    private WorkExperience workExperience; // 경력

    @Builder
    public ChosenExp(Resume resume, WorkExperience workExperience) {
        this.resume = resume;
        this.workExperience = workExperience;
        this.id = new ChosenExpId(
                resume != null ? resume.getId() : null,
                workExperience != null ? workExperience.getId() : null
        );
    }
}

