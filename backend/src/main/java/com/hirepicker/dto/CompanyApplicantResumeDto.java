package com.hirepicker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * 기업회원이 지원자의 이력서를 열람할 때 사용하는 DTO.
 */
@Getter
@Builder
@AllArgsConstructor
public class CompanyApplicantResumeDto {

    private final Long postingIdx; // 공고 PK
    private final Long resumeIdx; // 이력서 PK
    private final String applicantName; // 지원자 이름
    private final String applicantEmail; // 지원자 이메일
    private final String applicantPhone; // 지원자 연락처
    private final String resumeTitle; // 이력서 제목
    private final String imageUrl; // 이력서 사진 경로
    private final String selfGrowth; // 성장 배경
    private final String selfStrengths; // 성격 및 강점
    private final String selfMotivation; // 지원 동기
    private final String selfAspirations; // 입사 후 포부
    private final String cert; // 자격 요약
    private final WorkHistorySnippet workHistory; // 대표 경력 정보

    @Getter
    @Builder
    @AllArgsConstructor
    public static class WorkHistorySnippet {
        private final String companyName; // 경력 회사명
        private final String position; // 직책
        private final String department; // 부서
        private final String mainDuties; // 주요 직무
        private final String jobDescription; // 업무 설명
        private final String hireDate; // 입사일
        private final String resignDate; // 퇴사일
    }
}

