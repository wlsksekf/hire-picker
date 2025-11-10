package com.hirepicker.realtime;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.extern.slf4j.Slf4j;

/**
 * JobPosting 관련 SSE 구독자를 관리하고 변경 이벤트를 전파한다.
 */
@Component
@Slf4j
public class JobPostingUpdateBroadcaster {

    private static final long DEFAULT_TIMEOUT = 0L; // 무제한
    private static final String EVENT_NAME = "cUserChanged";

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> {
            emitters.remove(emitter);
            log.debug("SSE emitter error: {}", e.getMessage());
        });

        try {
            emitter.send(SseEmitter.event()
                    .name("heartbeat")
                    .data("connected")
                    .id(String.valueOf(Instant.now().toEpochMilli())));
        } catch (IOException e) {
            emitters.remove(emitter);
            log.debug("Failed to send initial heartbeat: {}", e.getMessage());
        }

        return emitter;
    }

    public void broadcast(String postingId, Long previousCUserIdx, Long currentCUserIdx) {
        if (emitters.isEmpty()) {
            return;
        }

        Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("postingId", postingId);
        payload.put("previousCUserIdx", previousCUserIdx);
        payload.put("currentCUserIdx", currentCUserIdx);

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .id(String.valueOf(Instant.now().toEpochMilli()))
                        .name(EVENT_NAME)
                        .data(payload));
            } catch (IOException e) {
                emitters.remove(emitter);
                log.debug("Remove broken SSE emitter: {}", e.getMessage());
            }
        }
    }
}

