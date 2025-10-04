package com.hirepicker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

//push Test
@RestController
@RequiredArgsConstructor
public class HealthController {
    @GetMapping("/health")
    public String checkHealth() {
        return "Server is running successfully!";
    }
}