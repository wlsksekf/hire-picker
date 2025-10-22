package com.hirepicker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.service.ManageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/manage")
@RequiredArgsConstructor
public class ManageController {
    
    private final ManageService mService;
    
    @GetMapping("/update/school")
    public ResponseEntity<String> updateSchool() {
        return mService.updateSchool();
    }
    
    @GetMapping("/schools")
    public ResponseEntity<?> getSchools() {
        return ResponseEntity.ok(mService.fetchSchoolData());
    }
}