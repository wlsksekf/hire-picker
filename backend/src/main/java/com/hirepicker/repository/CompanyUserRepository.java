package com.hirepicker.repository;

import com.hirepicker.entity.CompanyUser;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyUserRepository extends JpaRepository<CompanyUser, Long> {
    Optional<CompanyUser> findByLoginId(String loginId);

    // 이메일로 사용자를 찾는 메서드
    Optional<CompanyUser> findByEmail(String email);

    // 이메일 존재 여부 확인 메서드
    boolean existsByEmail(String email);

    // 로그인 아이디 존재 여부 확인 메서드
    boolean existsByLoginId(String loginId);

    List<CompanyUser> findByIsApproved(String isApproved); // 승인 상태별 목록 조회
}
