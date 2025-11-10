package com.hirepicker.dto;

import java.time.LocalDate;

import com.hirepicker.entity.JobPosting;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CalendarJobPostingDto {
    private Long id;
    private String companyName;
    private LocalDate start;
    private LocalDate end;
    private boolean allDay;
    private String type; // "jobPosting"

    public static CalendarJobPostingDto fromEntity(JobPosting jobPosting) {
        String companyName = "알 수 없는 회사"; // 기본값 설정
        if (jobPosting.getCompany() != null) {
            companyName = jobPosting.getCompany().getCompanyName();
        }
        return CalendarJobPostingDto.builder()
                .id(jobPosting.getPostingIdx())
                .companyName(companyName)
                .start(jobPosting.getStartDate())
                .end(jobPosting.getEndDate())
                .allDay(true) // Assuming job postings are all-day events
                .type("jobPosting")
                .build();
    }
}
