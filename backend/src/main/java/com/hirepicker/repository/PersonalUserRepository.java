package com.hirepicker.repository;

import com.hirepicker.entity.PersonalUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// PersonalUser 엔티티에 대한 데이터 접근을 처리하는 리포지토리
public interface PersonalUserRepository extends JpaRepository<PersonalUser, Long> {
    // 이메일로 사용자를 찾는 메서드
    Optional<PersonalUser> findByEmail(String email);
}