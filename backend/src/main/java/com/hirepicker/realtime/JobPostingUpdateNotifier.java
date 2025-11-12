package com.hirepicker.realtime;

import org.springframework.stereotype.Component;

/**
 * JPA Entity listener에서 직접 주입받기 어려워 static 브로커 참조를 제공한다.
 */
@Component
public class JobPostingUpdateNotifier {

    private static JobPostingUpdateBroadcaster broadcaster;

    public JobPostingUpdateNotifier(JobPostingUpdateBroadcaster broadcaster) {
        JobPostingUpdateNotifier.broadcaster = broadcaster;
    }

    public static void notifyChange(String postingId, Long previousCUserIdx, Long currentCUserIdx) {
        if (broadcaster != null) {
            broadcaster.broadcast(postingId, previousCUserIdx, currentCUserIdx);
        }
    }
}

