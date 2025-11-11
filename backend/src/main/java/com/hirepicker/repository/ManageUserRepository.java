package com.hirepicker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.ManageUser;

@Repository
public interface ManageUserRepository extends JpaRepository<ManageUser, Long> {

    Optional<ManageUser> findByLoginId(String loginId); // 로그인 ID로 관리자 계정 조회
}

