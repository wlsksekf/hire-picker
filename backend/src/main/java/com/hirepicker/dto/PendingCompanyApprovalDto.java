package com.hirepicker.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PendingCompanyApprovalDto {

    private final Long companyUserId;
    private final Long companyId;
    private final String companyName;
    private final String contactName;
    private final String contactEmail;
    private final String contactPhone;
    private final String verificationFileUrl; // 회사 인증 서류(S3 URL)
    private final LocalDate submittedDate;
    private final String approvalStatus;
}

