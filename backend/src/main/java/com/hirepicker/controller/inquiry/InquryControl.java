package com.hirepicker.controller.inquiry;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.config.security.CustomUserDetails;
import com.hirepicker.entity.Inquiry.Inquiries;
import com.hirepicker.service.Inquiry.InquiryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InquryControl {

    private final InquiryService inquiryService;

    @PostMapping("/inquiry/submit")
    public Map<String,Object> submit(@RequestBody Map<String,Object> body,
     @AuthenticationPrincipal CustomUserDetails userDetails ){

        Map<String,Object> m = new HashMap<>();
        System.out.println("도착도착도착");
        System.out.println("문의는 이겁니다 문의는 이거다 이거다"+body.get("content"));

        if(userDetails==null){
        System.out.println("로그인 필요함********");
        return null;
        }


        Long user_idx = Long.valueOf(userDetails.getId());

        Inquiries saveInquiry = inquiryService.save(body, user_idx);

        System.out.println(saveInquiry.getInquiryIdx()+"번 문의 DB 저장 완료다 씨봉");


        if(saveInquiry.getPUserIdx().equals(user_idx)){
            m.put("log", true);
            return m;
        }

        return null;

    }

    @GetMapping("/inquiries")
    public Map<String, Object> inquiries(@AuthenticationPrincipal CustomUserDetails userDetails){
        if(userDetails!=null){
            Map<String,Object> m = new HashMap<>();
            List<Inquiries> list = inquiryService.getAll();
            m.put("inquiries",list);
            System.out.println("상담 리스트 글 갖고오기 성공이다.");
            return m;
        }

        return null;
    }

@PostMapping("/inquiries/{inquiryIdx}/answer")
    public Map<String, Object> submitAnswer(@PathVariable Long inquiryIdx,
                                            @RequestBody Map<String, Object> body,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Map<String, Object> res = new HashMap<>();

        if (userDetails == null) {
            res.put("success", false);
            res.put("message", "로그인이 필요합니다.");
            return res;
        }

        String answerContent = (String) body.get("answerContent");
        if (answerContent == null || answerContent.trim().isEmpty()) {
            res.put("success", false);
            res.put("message", "답변 내용을 입력해주세요.");
            return res;
        }

        try {
            inquiryService.saveAnswer(inquiryIdx, userDetails.getId(), answerContent);
            res.put("success", true);
            res.put("message", "답변이 성공적으로 등록되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            res.put("success", false);
            res.put("message", "답변 등록 중 오류 발생");
        }

        return res;
    }


}
