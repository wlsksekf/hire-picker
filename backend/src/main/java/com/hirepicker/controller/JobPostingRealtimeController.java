package com.hirepicker.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.hirepicker.realtime.JobPostingUpdateBroadcaster;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/postings")
public class JobPostingRealtimeController {

    private final JobPostingUpdateBroadcaster broadcaster;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPostingUpdates() {
        return broadcaster.subscribe();
    }
}

