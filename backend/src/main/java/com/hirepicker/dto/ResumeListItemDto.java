package com.hirepicker.dto;

import com.hirepicker.entity.Resume;
import com.hirepicker.entity.WorkExperience;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

// ?´ë ¥??ëª©ë¡ ?‘ë‹µ??DTO(?„ìš” ?„ë“œë§?ê°„ë‹¨ ?¸ì¶œ)
@Getter
@AllArgsConstructor
public class ResumeListItemDto {
    private final Long id;           // ?´ë ¥??PK
    private final String title;      // ?œëª©
    private final String status;     // ê³µê°œ ?íƒœ(ë¬¸ì??
    private final boolean isDefault; // ê¸°ë³¸ ?´ë ¥???¬ë?
    private final String imageUrl;   // ?´ë?ì§€ URL
    private final Long expIdx;       // ?°ê²°??ê²½ë ¥ PK(?µì…˜)
    private final LocalDateTime modifiedDate; // ìµœì¢… ?˜ì •?¼ì‹œ

    // ?”í‹°??-> DTO ë³€???¸ì˜ ë©”ì„œ??
    public static ResumeListItemDto from(Resume resume, Long expIdx) { return new ResumeListItemDto( resume.getId(), resume.getTitle(), resume.getStatus() != null ? resume.getStatus().name() : null, resume.isDefault(), resume.getImageUrl(), expIdx, resume.getModifiedDate() ); }
}

