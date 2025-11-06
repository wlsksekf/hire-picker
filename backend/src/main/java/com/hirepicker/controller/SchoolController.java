package com.hirepicker.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.repository.SchoolRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolRepository schoolRepository;

    // 간단한 이름 부분검색 (상위 10건)
    @GetMapping("/search")
    public ResponseEntity<List<java.util.Map<String, Object>>> search(@RequestParam("name") String name) {
        var all = schoolRepository.findAll();
        // 간단 필터: 이름에 포함되는 항목만 반환 (실서비스는 Like/Index 권장)
        var filtered = all.stream()
                .filter(s -> s.getSchoolName() != null && s.getSchoolName().contains(name))
                .limit(10)
                .map(s -> java.util.Map.<String, Object>of(
                        "schoolCode", s.getSchoolCode(),
                        "schoolName", s.getSchoolName(),
                        "campus", s.getCampus()
                ))
                .toList();
        return ResponseEntity.ok(filtered);
    }
}

