package com.hirepicker.repository;

import com.hirepicker.entity.PersonalUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonalUserRepository extends JpaRepository<PersonalUser, Long> {
    Optional<PersonalUser> findByEmail(String email);
}
