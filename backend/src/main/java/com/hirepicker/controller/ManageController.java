package com.hirepicker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/manage")
@RequiredArgsConstructor
public class ManageController {

    @GetMapping("/update/school")
    public ResponseEntity<String> updateSchool() {
        return ResponseEntity.ok("School updated");
    }
}