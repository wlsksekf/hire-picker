package com.hirepicker.dto;

import com.hirepicker.entity.Resume;
import lombok.Getter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// 이력서 상세 응답 DTO (보기용)
@Getter
public class ResumeDetailDto {
    private final Long id;             // PK
    private final String title;        // 제목
    private final String imageUrl;     // 이미지 URL
    private final String selfGrowth;   // 성장 배경
    private final String selfStrengths;// 성격/강점
    private final String selfMotivation;// 지원 동기
    private final String selfAspirations;// 포부
    private final String status;       // 공개 상태
    private final String cert;         // 자격 요약
    private final java.time.LocalDateTime modifiedDate; // 최종 수정일
    private final Long expIdx;         // 연결 경력 PK(옵션)

    // 추가: 개인/학력/경력/병역 상세 포함 생성자
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

    // 개인 정보
    private final Personal personal; // 이름/이메일/전화/주소/성별
    // 학력 목록
    private final List<Academic> academics;
    // 경력 목록
    private final List<Experience> experiences;
    // 병역 정보(옵션)
    private final Military military;

    // 개인 정보 DTO
    @Getter
    @AllArgsConstructor
    public static class Personal {
        private final String name;       // 이름
        private final String email;      // 이메일
        private final String phone;      // 전화번호
        private final String address;    // 주소
        private final String gender;     // 성별(MALE/FEMALE)
    }

    // 학력 DTO(간단 보기)
    @Getter
    @AllArgsConstructor
    public static class Academic {
        private final String schoolName;   // 학교명
        private final String degree;       // 학위
        private final String major;        // 전공
        private final BigDecimal majorScore; // 전공 학점
        private final LocalDate graduationDate; // 졸업일
    }

    // 경력 DTO(간단 보기)
    @Getter
    @AllArgsConstructor
    public static class Experience {
        private final String companyName;   // 회사명
        private final String department;    // 부서
        private final String position;      // 직책
        private final LocalDate hireDate;   // 입사일
        private final LocalDate resignDate; // 퇴사일
        private final String jobDescription;// 직무설명
        private final String mainDuties;    // 주요 직무
    }

    // 병역 DTO
    @Getter
    @AllArgsConstructor
    public static class Military {
        private final String serviceType;      // 병역 유형
        private final String militaryBranch;   // 병과
        private final String militaryRank;     // 계급
        private final String periodOfService;  // 복무 기간
        private final String reasonForExemption; // 면제 사유
    }
}