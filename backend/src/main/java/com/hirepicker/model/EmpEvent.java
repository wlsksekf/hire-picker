package com.hirepicker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "emp_event")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_idx")
    private Long eventIdx;

    @Column(name = "event_code", unique = true)
    private String eventCode;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "event_duration")
    private String eventDuration;

    @Column(name = "area")
    private String area;
}
