package com.hirepicker.repository;

import com.hirepicker.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Optional<JobPosting> findByPostingId(String postingId);
}
