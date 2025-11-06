package com.hirepicker.service;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hirepicker.dto.CompanyReviewDto;
import com.hirepicker.entity.ComReview;
import com.hirepicker.entity.Company;
import com.hirepicker.entity.JobPosting;
import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.Resume;
import com.hirepicker.repository.ApplicationsRepository;
import com.hirepicker.repository.ComReviewRepository;
import com.hirepicker.repository.CompanyRepository;
import com.hirepicker.repository.JobPostingRepository;
import com.hirepicker.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ApplicationsRepository applicationsRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ComReviewRepository comReviewRepository;
    private final ResumeRepository resumeRepository; // ResumeRepository 주입
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<CompanyReviewDto> getReviewableCompanies(Long userId) {
        log.info("Fetching reviewable companies for userId: {}", userId);

        // 1. 사용자 ID(p_user_idx)로 이력서 목록 조회
        List<Resume> resumes = resumeRepository.findByPersonalUser_Id(userId);
        log.info("Found {} resumes for userId: {}", resumes.size(), userId);
        if (resumes.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 이력서 ID 목록 추출
        List<Long> resumeIdxs = resumes.stream()
                .map(Resume::getId)
                .collect(Collectors.toList());
        log.info("Resume Ids: {}", resumeIdxs);

        // 3. 이력서 ID와 상태(status="3")로 채용 공고 ID 목록 조회
        List<Long> postingIdxs = applicationsRepository.findPostingIdxByResumeIdxInAndStatus(resumeIdxs, "3");
        log.info("Found {} postingIdxs with status '3' for resumeIdxs: {}", postingIdxs.size(), resumeIdxs);

        if (postingIdxs.isEmpty()) {
            return List.of();
        }

        List<JobPosting> jobPostings = jobPostingRepository.findByPostingIdxIn(postingIdxs);
        log.info("Found {} jobPostings for postingIdxs: {}", jobPostings.size(), postingIdxs);
        if (jobPostings.isEmpty()) {
            return List.of();
        }

        List<CompanyReviewDto> reviewableCompanies = jobPostings.stream()
                .map(JobPosting::getCompany)
                .distinct()
                .map(company -> new CompanyReviewDto(company.getCompanyIdx(), company.getCompanyName()))
                .collect(Collectors.toList());
        log.info("Returning {} reviewable companies.", reviewableCompanies.size());

        return reviewableCompanies;
    }

    public Optional<ComReview> getMyReview(Long companyId, PersonalUser personalUser) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회사를 찾을 수 없습니다. id=" + companyId));
        return comReviewRepository.findByCompanyAndPersonalUser(company, personalUser);
    }

    @Transactional
    public ComReview saveReview(Long companyId, String reviewContent, String reviewerType, PersonalUser personalUser,
            Long reviewIdx) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회사를 찾을 수 없습니다. id=" + companyId));
        ComReview comReview;
        if (reviewIdx != null) {
            // Update existing review
            comReview = comReviewRepository.findById(reviewIdx)
                    .orElseThrow(() -> new IllegalArgumentException("Review not found with ID: " + reviewIdx));
            comReview.setContent(reviewContent);
            comReview.setReviewerType(reviewerType);
            comReview.setWriteDate(new Date()); // Update date
        } else {
            // Create new review
            comReview = ComReview.builder()
                    .company(company)
                    .content(reviewContent)
                    .reviewerType(reviewerType)
                    .personalUser(personalUser) // Set pUserIdx for new review
                    .writeDate(new Date())
                    .build();
            comReviewRepository.save(comReview);
        }
        return comReview;
    }
}
