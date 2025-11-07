package com.hirepicker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 관리자가 승인/거부 처리할 기업회원 정보 DTO
 * 
 * 사용처: /api/admin/company-users/pending 응답
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyUserApprovalDto {
    /** 기업회원 ID (PK) */
    private Long userId;
    
    /** 로그인 아이디 */
    private String loginId;
    
    /** 담당자명 */
    private String name;
    
    /** 이메일 */
    private String email;
    
    /** 전화번호 */
    private String phoneNumber;
    
    /** 회사명 */
    private String companyName;
    
    /** 회사 ID */
    private Long companyId;
    
    /** 인증 파일 URL (S3) */
    private String verificationFileUrl;
    
    /** 승인 상태 (PENDING, APPROVED, REJECTED) */
    private String approvalStatus;
    
    /** 등록일 */
    private LocalDate regDate;
}

