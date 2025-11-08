package com.hirepicker.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 채팅 메시지 엔티티(chat_message 테이블 매핑)
@Entity
@Table(name = "chat_message")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK

    @Column(name = "room_id", nullable = false, length = 255)
    private String roomId; // 채팅방 ID (postId와 동일)

    @Column(name = "sender", length = 255)
    private String sender; // 발신자

    @Lob
    @Column(name = "content", columnDefinition = "TEXT")
    private String content; // 메시지 내용

    @Column(name = "created_at")
    private LocalDateTime createdAt; // 생성일시
}
