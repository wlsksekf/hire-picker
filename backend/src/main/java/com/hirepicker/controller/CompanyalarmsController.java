package com.hirepicker.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.entity.Companyalarms;
import com.hirepicker.service.CompanyalarmsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/company-alarms")
@RequiredArgsConstructor
public class CompanyalarmsController {
    private final CompanyalarmsService companyalarmsService;

    @PostMapping
    public ResponseEntity<?> addCompanyAlarm(@RequestBody Map<String, Long> payload) {
        Long pUserIdx = payload.get("p_user_idx");
        Long companyIdx = payload.get("company_idx");
        if (pUserIdx == null || companyIdx == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            Companyalarms companyalarms = companyalarmsService.addCompanyAlarm(pUserIdx, companyIdx);
            return new ResponseEntity<>(companyalarms, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @DeleteMapping("/{pUserIdx}/{companyIdx}")
    public ResponseEntity<Void> removeCompanyAlarm(@PathVariable Long pUserIdx, @PathVariable Long companyIdx) {
        try {
            companyalarmsService.removeCompanyAlarm(pUserIdx, companyIdx);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{pUserIdx}")
    public ResponseEntity<List<Long>> getLikedCompanyIdsByPersonalUser(@PathVariable Long pUserIdx) {
        List<Long> likedCompanyIds = companyalarmsService.getLikedCompanyIdsByPersonalUser(pUserIdx);
        return new ResponseEntity<>(likedCompanyIds, HttpStatus.OK);
    }
}
