package com.hirepicker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // JPA 엔티티임을 선언
@Table(name = "emp_event") // "emp_event" 테이블과 매핑
@Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor를 모두
      // 포함
@Builder // 빌더 패턴을 사용하여 객체 생성
@NoArgsConstructor // 기본 생성자 자동 생성
@AllArgsConstructor // 모든 필드를 포함하는 생성자 자동 생성
public class EmpEvent {

    @Id // 기본 키 필드
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본 키 값 자동 생성 (DB에 위임)
    @Column(name = "event_idx") // "event_idx" 컬럼과 매핑
    private Long eventIdx;

    @Column(name = "event_code", unique = true) // 유니크한 "event_code" 컬럼과 매핑
    private String eventCode;

    @Column(name = "event_name") // "event_name" 컬럼과 매핑
    private String eventName;

    @Column(name = "event_duration") // "event_duration" 컬럼과 매핑
    private String eventDuration;

    @Column(name = "area") // "area" 컬럼과 매핑
    private String area;

    @Column(name = "event_status") // 행사 상태 필드 추가
    @Builder.Default // 빌더 패턴 사용 시 기본값 설정
    private String eventStatus = "OPEN"; // 기본값 OPEN
}
