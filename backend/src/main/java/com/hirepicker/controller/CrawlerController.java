package com.hirepicker.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.service.CompanyInfoCrawlerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {

    private final CompanyInfoCrawlerService crawlerService;

    @PostMapping("/companies")
    public String startCompanyCrawling() {
        crawlerService.startCrawling();
        return "크롤링이 시작되었습니다. 진행상황은 서버 로그에서 확인할 수 있습니다.";
    }
}