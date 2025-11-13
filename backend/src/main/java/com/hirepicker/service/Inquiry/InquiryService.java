package com.hirepicker.service.Inquiry;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.hirepicker.entity.Inquiry.Inquiries;
import com.hirepicker.repository.Inquiry.InquiryRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;


    public Inquiries save(Map<String,Object> body, Long u_idx){
        Inquiries buildInquires = new Inquiries();
        buildInquires.setCategory(String.valueOf(body.get("category")));
        buildInquires.setTitle(String.valueOf(body.get("title")));
        buildInquires.setContent(String.valueOf(body.get("content")));
        buildInquires.setPUserIdx(u_idx);

        return inquiryRepository.save(buildInquires);
    }

    public List<Inquiries> getAll(){
        return inquiryRepository.findAllByOrderByCreatedAtDesc();
    }

@Transactional
    public void saveAnswer(Long inquiryIdx, Long managerUserIdx, String answerContent) {
        Inquiries inquiry = inquiryRepository.findById(inquiryIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));

        inquiry.setAnswerContent(answerContent);
        inquiry.setMUserIdx(managerUserIdx);
        inquiry.setStatus(Inquiries.InquiryStatus.ANSWERED); // ✅ Enum 상수로 설정
        inquiry.setUpdatedAt(LocalDateTime.now());

        inquiryRepository.save(inquiry);

        System.out.println("✅ [" + inquiryIdx + "]번 문의 답변 등록 완료");
    }

}
