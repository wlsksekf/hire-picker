package com.hirepicker.controller;

import com.hirepicker.dto.SchoolDto;
import com.hirepicker.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @GetMapping("/search")
    public ResponseEntity<List<SchoolDto>> searchSchools(@RequestParam String name) {
        List<SchoolDto> schools = schoolService.searchSchoolsByName(name);
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/find")
    public ResponseEntity<SchoolDto> findExactSchool(@RequestParam String name) {
        Optional<SchoolDto> school = schoolService.findExactSchoolByName(name);
        return school.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}