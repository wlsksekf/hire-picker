package com.hirepicker.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Builder
public class ReportResponseDto {
    private Long reportHistoryIdx;
    private Long targetIdx;
    private String reason;
    private LocalDateTime reportDate; // "LocalDateTime"으로 선언!
    private String nickname;

    // JPQL에서 그대로 사용할 생성자—타입/순서 정확히 일치!
    public ReportResponseDto(Long reportHistoryIdx, Long targetIdx, String reason, LocalDateTime reportDate, String nickname) {
        this.reportHistoryIdx = reportHistoryIdx;
        this.targetIdx = targetIdx;
        this.reason = reason;
        this.reportDate = reportDate;
        this.nickname = nickname;
    }
}
