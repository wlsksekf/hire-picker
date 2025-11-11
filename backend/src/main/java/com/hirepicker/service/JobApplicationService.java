package com.hirepicker.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.JobApplicationResponse;
import com.hirepicker.entity.Applications;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.Resume;
import com.hirepicker.entity.UserType;
import com.hirepicker.repository.ApplicationsRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobApplicationService {

    private static final String DEFAULT_STATUS = "APPLIED";

    private final ApplicationsRepository applicationsRepository;
    private final ResumeRepository resumeRepository;
    private final JobPostingRepository jobPostingRepository;

    @Transactional
    public JobApplicationResponse apply(Long postingIdx, Long resumeId, Long applicantId, UserType userType) {
        if (userType != UserType.PERSONAL) {
            throw new IllegalStateException("개인 회원만 지원할 수 있습니다.");
        }

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("선택한 이력서를 찾을 수 없습니다."));

        if (!resume.getPersonalUser().getId().equals(applicantId)) {
            throw new IllegalStateException("본인 이력서로만 지원할 수 있습니다.");
        }

        JobPosting jobPosting = jobPostingRepository.findById(postingIdx)
                .orElseThrow(() -> new IllegalArgumentException("채용 공고를 찾을 수 없습니다."));

        // 외부 공고라면 지원 링크로 리다이렉트
        if (jobPosting.getCUserIdx() == null) {
            String applyUrl = jobPosting.getApplyUrl();
            if (applyUrl == null || applyUrl.isBlank()) {
                throw new IllegalStateException("지원 링크가 제공되지 않은 공고입니다.");
            }
            return JobApplicationResponse.redirect(applyUrl, "외부 지원 페이지로 이동합니다.");
        }

        if (applicationsRepository.existsByResumeIdxAndPostingIdx(resumeId, postingIdx)) {
            throw new IllegalStateException("이미 지원한 공고입니다.");
        }

        Applications application = Applications.builder()
                .resumeIdx(resumeId)
                .postingIdx(postingIdx)
                .resumeDate(LocalDateTime.now())
                .status(DEFAULT_STATUS)
                .build();
        applicationsRepository.save(application);

        log.info("Resume {} applied to posting {}", resumeId, postingIdx);

        return JobApplicationResponse.success("지원이 완료되었습니다.");
    }
}

