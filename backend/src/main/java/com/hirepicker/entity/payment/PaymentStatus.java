package com.hirepicker.entity.payment;

// 결제 상태를 나타내는 Enum
public enum PaymentStatus {
    PENDING,        // 결제 생성됨 (결제 시도 전)
    DONE,           // 결제 완료 (크레딧 지급 완료)
    FAILED,         // 결제 실패
    PENDING_DEPOSIT // 가상계좌 입금 대기
}
