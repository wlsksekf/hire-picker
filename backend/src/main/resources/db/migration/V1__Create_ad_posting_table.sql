-- 광고 공고 테이블 생성 (기존 채용공고를 광고로 프로모션)
CREATE TABLE IF NOT EXISTS ad_posting (
    ad_posting_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '광고 공고 ID',
    company_user_id BIGINT NOT NULL COMMENT '회사회원 ID',
    posting_idx BIGINT NOT NULL COMMENT '채용공고 ID (광고로 등록할 공고)',
    start_date DATETIME NOT NULL COMMENT '광고 시작 날짜',
    end_date DATETIME NOT NULL COMMENT '광고 종료 날짜',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '광고 상태 (PENDING, ACTIVE, EXPIRED, REJECTED)',
    view_count BIGINT DEFAULT 0 COMMENT '조회수',
    click_count BIGINT DEFAULT 0 COMMENT '클릭수',
    credit_amount INT NOT NULL DEFAULT 10000 COMMENT '사용한 크레딧',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 날짜',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 날짜',
    FOREIGN KEY (company_user_id) REFERENCES company_user(company_user_id) ON DELETE CASCADE,
    FOREIGN KEY (posting_idx) REFERENCES job_posting(posting_idx) ON DELETE CASCADE,
    INDEX idx_company_user_id (company_user_id),
    INDEX idx_posting_idx (posting_idx),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_created_at (created_at),
    UNIQUE KEY uk_posting_idx_status (posting_idx, status) -- 같은 공고가 중복 광고 방지
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='광고 공고 테이블';

