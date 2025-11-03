package com.hirepicker.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.repository.CompanyRepository;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "사용자", description = "사용자 정보 관련 API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j // Slf4j 어노테이션 추가
public class CompanyUserController {
    private final CompanyRepository companyRepository;
}
