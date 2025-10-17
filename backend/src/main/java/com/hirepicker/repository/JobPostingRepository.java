package com.hirepicker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.JobPosting;

import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Optional<JobPosting> findByPostingId(String postingId);
}
