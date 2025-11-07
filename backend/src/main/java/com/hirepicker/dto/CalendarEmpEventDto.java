package com.hirepicker.dto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.hirepicker.entity.EmpEvent;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CalendarEmpEventDto {
    private Long id;
    private String title;
    private LocalDate start;
    private LocalDate end;
    private boolean allDay;
    private String type; // "empEvent"
    private String area;

    // Helper to parse "YYYY-MM-DD ~ YYYY-MM-DD" format
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static CalendarEmpEventDto fromEntity(EmpEvent empEvent) {
        LocalDate startDate = null;
        LocalDate endDate = null;

        if (empEvent.getEventDuration() != null && empEvent.getEventDuration().contains("~")) {
            String[] dates = empEvent.getEventDuration().split("~");
            if (dates.length == 2) {
                try {
                    startDate = LocalDate.parse(dates[0].trim(), FORMATTER);
                    endDate = LocalDate.parse(dates[1].trim(), FORMATTER);
                } catch (Exception e) {
                    // Log error or handle invalid date format
                    System.err.println(
                            "Error parsing eventDuration: " + empEvent.getEventDuration() + " - " + e.getMessage());
                }
            }
        }

        return CalendarEmpEventDto.builder()
                .id(empEvent.getEventIdx())
                .title(empEvent.getEventName())
                .start(startDate)
                .end(endDate)
                .allDay(true) // Assuming events are all-day events
                .type("empEvent")
                .area(empEvent.getArea() + "[채용행사]")
                .build();
    }
}
