// package com.hirepicker.service;

// import java.nio.charset.StandardCharsets;

// import org.springframework.data.redis.connection.Message;
// import org.springframework.data.redis.connection.MessageListener;
// import org.springframework.lang.Nullable;
// import org.springframework.stereotype.Service;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.hirepicker.controller.ChatServerEndpoint; // (static 호출을 위해 import는 필요)
// import com.hirepicker.dto.ChatMessageDTO;

// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor // (ObjectMapper 주입을 위해 필요)
// public class RedisSubScriber implements MessageListener {
    
//     private final ObjectMapper objectMapper;

//     // [수정 2] 수동 생성자 삭제

//     @Override
//     public void onMessage(Message message, @Nullable byte[] pattern) {
 
//     try {
//         // 1. Redis에서 받은 원본 JSON 문자열
//         String jsonBody = new String(message.getBody(), StandardCharsets.UTF_8);
        
//         // 2. (선택) 로그를 찍기 위해 DTO로 변환
//         ChatMessageDTO chatMessageDto = objectMapper.readValue(jsonBody, ChatMessageDTO.class);
//         System.out.println("Redis Channel: " + chatMessageDto.getRoomId()+"  And 받은 메시지: " + chatMessageDto.getContent());


//         // +  static 호출로 변경, 오타 수정 (Tosession -> ToSessions)
//         ChatServerEndpoint.broadcastToSessions(chatMessageDto.getRoomId(), jsonBody); 

//     } 
//     catch (Exception e) {
//         e.printStackTrace();
//     }
// }
    
// }