package com.hirepicker.repository.Inquiry;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.Inquiry.Inquiries;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiries,Long> {
    List<Inquiries> findAllByOrderByCreatedAtDesc();

}
