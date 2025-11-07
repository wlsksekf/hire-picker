package com.hirepicker.dto;

import com.hirepicker.entity.Resume;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// ?�력???�세 ?�답 DTO (?�기??
@Getter
public class ResumeDetailDto {
    private final Long id;             // PK
    private final String title;        // ?�목
    private final String imageUrl;     // ?��?지 URL
    private final String selfGrowth;   // ?�장 배경
    private final String selfStrengths;// ?�격/강점
    private final String selfMotivation;// 지???�기
    private final String selfAspirations;// ?��?
    private final String status;       // 공개 ?�태
    private final String cert;         // ?�격 ?�약
    private final java.time.LocalDateTime modifiedDate; // 최종 ?�정??
    private final Long expIdx;         // ?�결 경력 PK(?�션)

    // 추�?: 개인/?�력/경력/병역 ?�세 ?�함 ?�성??
    @Builder
    public ResumeDetailDto(Resume r,
                           Long expIdx,
                           Personal personal,
                           List<Academic> academics,
                           List<Experience> experiences,
                           Military military) {
        this.id = r.getId();
        this.title = r.getTitle();
        this.imageUrl = r.getImageUrl();
        this.selfGrowth = r.getSelfGrowth();
        this.selfStrengths = r.getSelfStrengths();
        this.selfMotivation = r.getSelfMotivation();
        this.selfAspirations = r.getSelfAspirations();
        this.status = r.getStatus() != null ? r.getStatus().name() : null;
        this.cert = r.getCert();
        this.modifiedDate = r.getModifiedDate();
        this.expIdx = expIdx;
        this.personal = personal;
        this.academics = academics;
        this.experiences = experiences;
        this.military = military;
    }

    // 개인 ?�보
    private final Personal personal; // ?�름/?�메???�화/주소/?�별
    // ?�력 목록
    private final List<Academic> academics;
    // 경력 목록
    private final List<Experience> experiences;
    // 병역 ?�보(?�션)
    private final Military military;

    // 개인 ?�보 DTO
    @Getter
    @AllArgsConstructor
    public static class Personal {
        private final String name;       // ?�름
        private final String email;      // ?�메??
        private final String phone;      // ?�화번호
        private final String address;    // 주소
        private final String gender;     // ?�별(MALE/FEMALE)
    }

    // ?�력 DTO(간단 ?�기)
    @Getter
    @AllArgsConstructor
    public static class Academic {
        private final String schoolName;   // ?�교�?
        private final String degree;       // ?�위
        private final String major;        // ?�공
        private final BigDecimal majorScore; // ?�공 ?�점
        private final LocalDate graduationDate; // 졸업??
    }

    // 경력 DTO(간단 ?�기)
    @Getter
    @AllArgsConstructor
    public static class Experience {
        private final String companyName;   // ?�사�?
        private final String department;    // 부??
        private final String position;      // 직책
        private final LocalDate hireDate;   // ?�사??
        private final LocalDate resignDate; // ?�사??
        private final String jobDescription;// ?�무?�명
        private final String mainDuties;    // 주요 직무
    }

    // 병역 DTO
    @Getter
    @AllArgsConstructor
    public static class Military {
        private final String serviceType;      // 병역 ?�형
        private final String militaryBranch;   // 병과
        private final String militaryRank;     // 계급
        private final String periodOfService;  // 복무 기간
        private final String reasonForExemption; // 면제 ?�유
    }
}

