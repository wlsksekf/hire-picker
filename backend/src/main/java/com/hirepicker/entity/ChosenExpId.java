package com.hirepicker.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 선택경력 매핑(chosen_exp)의 복합키 (resume_idx, exp_idx)
@Embeddable
@Getter
@NoArgsConstructor
@EqualsAndHashCode
public class ChosenExpId implements Serializable {
    private Long resumeId; // resumes.resume_idx
    private Long expId;    // work_experience.exp_idx

    public ChosenExpId(Long resumeId, Long expId) {
        this.resumeId = resumeId;
        this.expId = expId;
    }
}

