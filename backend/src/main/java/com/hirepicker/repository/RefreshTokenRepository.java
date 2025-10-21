package com.hirepicker.repository;

import com.hirepicker.entity.PersonalUser;
import com.hirepicker.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findAllByPersonalUserAndActiveTrue(PersonalUser personalUser);
    void deleteByPersonalUser(PersonalUser personalUser); // 사용자 관련 모든 리프레시 토큰 삭제
}
