package com.hirepicker.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.ApplicationStatusDto;
import com.hirepicker.entity.Applications;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.Resume;
import com.hirepicker.repository.ApplicationsRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;

/**
 * 개인회원 지원 현황 조회 서비스.
 */
@Service
@RequiredArgsConstructor
public class ApplicationQueryService {

    private final ResumeRepository resumeRepository;
    private final ApplicationsRepository applicationsRepository;
    private final JobPostingRepository jobPostingRepository;

    /**
     * 개인회원이 지원한 채용공고 목록을 조회한다.
     */
    @Transactional(readOnly = true)
    public List<ApplicationStatusDto> getApplicationsByPersonalUser(Long personalUserId) {
        List<Resume> resumes = resumeRepository.findByPersonalUserIdOrderByIdDesc(personalUserId);
        if (resumes.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> resumeIds = resumes.stream()
                .map(Resume::getId)
                .toList();

        List<Applications> applications = applicationsRepository.findByResumeIdxIn(resumeIds);
        if (applications.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> postingIdxs = applications.stream()
                .map(Applications::getPostingIdx)
                .distinct()
                .toList();

        Map<Long, JobPosting> postingMap = jobPostingRepository.findByPostingIdxIn(postingIdxs)
                .stream()
                .collect(Collectors.toMap(JobPosting::getPostingIdx, posting -> posting));

        Map<Long, Resume> resumeMap = resumes.stream()
                .collect(Collectors.toMap(Resume::getId, resume -> resume));

        return applications.stream()
                .map(application -> convertToDto(application, resumeMap, postingMap))
                .collect(Collectors.toList());
    }

    private ApplicationStatusDto convertToDto(Applications application,
            Map<Long, Resume> resumeMap,
            Map<Long, JobPosting> postingMap) {
        JobPosting posting = postingMap.get(application.getPostingIdx());
        String companyName = posting != null && posting.getCompany() != null
                ? posting.getCompany().getCompanyName()
                : null;

        return ApplicationStatusDto.builder()
                .resumeIdx(application.getResumeIdx())
                .postingIdx(application.getPostingIdx())
                .postingId(posting != null ? posting.getPostingId() : null)
                .companyName(companyName)
                .postingTitle(posting != null ? posting.getTitle() : null)
                .status(application.getStatus())
                .appliedAt(application.getResumeDate())
                .build();
    }
}

