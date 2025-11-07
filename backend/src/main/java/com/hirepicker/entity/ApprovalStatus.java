package com.hirepicker.entity;

/**
 * 기업회원 승인 상태 상수
 *
 * 사용처: CompanyUser.isApproved 필드에 저장되는 문자열 값
 */
public class ApprovalStatus {
    /** 승인 대기 중 (회원가입 직후 기본값) */
    public static final String PENDING = "PENDING";

    /** 승인됨 (관리자가 승인 완료, 로그인 가능) */
    public static final String APPROVED = "APPROVED";

    /** 거부됨 (관리자가 거부, 로그인 불가) */
    public static final String REJECTED = "REJECTED";

    // 인스턴스 생성 방지
    private ApprovalStatus() {}
}

