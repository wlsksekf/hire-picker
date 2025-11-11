package com.hirepicker.service;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.dto.ResumeMarketItemDto;
import com.hirepicker.dto.ResumePurchaseResponse;
import com.hirepicker.entity.*;
import com.hirepicker.exception.InsufficientCreditsException;
import com.hirepicker.repository.ApplicationsRepository;
import com.hirepicker.repository.PersonalUserRepository;
import com.hirepicker.repository.ResumePurchaseRepository;
import com.hirepicker.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeMarketplaceService {

    private static final Map<String, String> STATUS_LABELS = Map.of(
            "0", "지원중",
            "1", "서류합격",
            "2", "면접합격",
            "3", "최종합격",
            "4", "서류탈락"
    );

    private static final List<String> STATUS_PRIORITY = List.of("3", "2", "1", "0", "4");

    private final ResumeRepository resumeRepository;
    private final ResumePurchaseRepository resumePurchaseRepository;
    private final ApplicationsRepository applicationsRepository;
    private final PersonalUserRepository personalUserRepository;
    private final CreditService creditService;

    @Transactional(readOnly = true)
    public List<ResumeMarketItemDto> getMarketplaceResumes(CustomUserDetails userDetails) {
        List<Resume> resumes = resumeRepository.findByStatusAndCreditCostGreaterThanEqual(ResumeStatus.PUBLIC, 0);
        return resumes.stream()
                .map(resume -> toMarketItem(resume, userDetails))
                .collect(Collectors.toList());
    }

    @Transactional
    public ResumePurchaseResponse purchaseResume(Long resumeId, CustomUserDetails userDetails) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 이력서입니다."));

        if (resume.getStatus() != ResumeStatus.PUBLIC) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비공개 이력서는 구매할 수 없습니다.");
        }

        if (userDetails.getUserType() != UserType.PERSONAL) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "개인 회원만 구매할 수 있습니다.");
        }

        if (resume.getPersonalUser().getId().equals(userDetails.getId())) {
            return new ResumePurchaseResponse(true, "본인 이력서는 구매 없이 열람할 수 있습니다.", null, true);
        }

        if (isPurchased(resume.getId(), userDetails)) {
            Long balance = creditService.getCreditBalance(userDetails);
            return new ResumePurchaseResponse(true, "이미 구매한 이력서입니다.", balance, true);
        }

        int cost = Math.max(resume.getCreditCost(), 0);
        if (cost > 0) {
            try {
                creditService.useCredits(userDetails, "RESUME_PURCHASE", (long) cost);
            } catch (InsufficientCreditsException e) {
                throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, e.getMessage());
            }
        }

        PersonalUser buyer = personalUserRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "개인 회원을 찾을 수 없습니다."));

        resumePurchaseRepository.save(ResumePurchase.builder()
                .resume(resume)
                .personalUser(buyer)
                .resumeCreditsUsed((long) cost)
                .build());
        Long balance = creditService.getCreditBalance(userDetails);

        return new ResumePurchaseResponse(true, "이력서를 구매했습니다.", balance, false);
    }

    @Transactional(readOnly = true)
    public boolean isPurchased(Long resumeId, CustomUserDetails userDetails) {
        if (userDetails.getUserType() == UserType.PERSONAL) {
            return resumePurchaseRepository.existsByResume_IdAndPersonalUser_Id(resumeId, userDetails.getId());
        }
        return false;
    }

    private ResumeMarketItemDto toMarketItem(Resume resume, CustomUserDetails userDetails) {
        Map<String, Long> statusSummary = aggregateStatus(resume.getId());
        String highlightStatus = resolveHighlight(statusSummary);

        String ownerName = resume.getPersonalUser() != null ? resume.getPersonalUser().getName() : "익명";
        String jobTitle = resume.getWorkExperience() != null ? resume.getWorkExperience().getPosition() : null;
        String summary = summarizeResume(resume);
        boolean purchased = userDetails != null && isPurchased(resume.getId(), userDetails);

        return ResumeMarketItemDto.builder()
                .resumeId(resume.getId())
                .title(resume.getTitle())
                .ownerName(ownerName)
                .ownerJobTitle(jobTitle)
                .summary(summary)
                .creditCost(resume.getCreditCost())
                .highlightStatus(highlightStatus)
                .statusSummary(statusSummary)
                .purchased(purchased)
                .imageUrl(resume.getImageUrl())
                .updatedAt(resume.getModifiedDate())
                .build();
    }

    private Map<String, Long> aggregateStatus(Long resumeId) {
        List<Applications> applications = applicationsRepository.findByResumeIdx(resumeId);
        if (applications.isEmpty()) {
            return Map.of();
        }
        Map<String, Long> counts = new HashMap<>();
        for (Applications application : applications) {
            String status = application.getStatus();
            if (status == null) continue;
            counts.merge(status, 1L, (existing, added) -> existing + added);
        }
        return counts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(LinkedHashMap::new,
                        (map, entry) -> map.put(entry.getKey(), entry.getValue()),
                        Map::putAll);
    }

    private String resolveHighlight(Map<String, Long> summary) {
        if (summary.isEmpty()) {
            return "지원 이력 없음";
        }
        for (String statusCode : STATUS_PRIORITY) {
            if (summary.getOrDefault(statusCode, 0L) > 0) {
                return STATUS_LABELS.getOrDefault(statusCode, "기록 없음");
            }
        }
        return "기록 없음";
    }

    private String summarizeResume(Resume resume) {
        String base = resume.getSelfStrengths();
        if (base == null || base.isBlank()) {
            base = resume.getSelfGrowth();
        }
        if (base == null || base.isBlank()) {
            return "자기소개가 등록되지 않았습니다.";
        }
        String trimmed = base.replaceAll("\\s+", " ").trim();
        return trimmed.length() > 120 ? trimmed.substring(0, 117) + "..." : trimmed;
    }
}

