package com.hirepicker.service; // (패키지 경로는 본인에 맞게)

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.lang.Nullable;
import org.springframework.messaging.simp.SimpMessagingTemplate; // [추가] Spring의 메시지 발송기
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirepicker.dto.ChatMessageDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisSubScriber implements MessageListener {
    
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate; // [추가] Spring의 발송기를 주입받음

    @SuppressWarnings("null")
    @Override
    public void onMessage(Message message, @Nullable byte[] pattern) {
 
    try {
        // 1. Redis에서 받은 원본 JSON 문자열
        String jsonBody = new String(message.getBody(), "UTF-8"); // (인코딩 명시)
        
        // 2. DTO로 변환
        ChatMessageDTO chatMessageDto = objectMapper.readValue(jsonBody, ChatMessageDTO.class);
        System.out.println("Redis Channel: " + chatMessageDto.getRoomId()+"  And 받은 메시지: " + chatMessageDto.getContent());

        // --- [핵심 변경] ---
        // 3. Spring 브로커를 통해 클라이언트에게 메시지 전송
        //    (WebSocketConfig에서 /topic으로 시작하도록 설정했음)
        //    (ChatServerEndpoint.broadcastToSessions() 대신 이걸 씀)
        messagingTemplate.convertAndSend("/topic/room/" + chatMessageDto.getRoomId(), chatMessageDto);

    } 
    catch (Exception e) {
        e.printStackTrace();
    }
}
    
}