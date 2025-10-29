package com.hirepicker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.service.CompanyInfoCrawlerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {

    private final CompanyInfoCrawlerService crawlerService;

    @GetMapping("/companies")
    public String startCompanyCrawlingGet() {
        // GET 요청으로도 크롤링을 트리거하도록 지원합니다 (프로젝트의 다른 엔드포인트와 일관성 유지)
        crawlerService.startCrawling();
        return "크롤링이 시작되었습니다 (GET). 진행상황은 서버 로그에서 확인할 수 있습니다.";
    }
}