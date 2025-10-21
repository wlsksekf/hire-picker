package com.hirepicker.service;

import java.nio.charset.StandardCharsets;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirepicker.dto.ChatMessageDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisSubScriber implements MessageListener {
    private final ObjectMapper objectMapper;
    @Override
    public void onMessage(Message message, @Nullable byte[] pattern) {
 
    try {
        // receivedMessage를 Dto형식으로 만들어서 저장 해줘야함(역직렬화)
        ChatMessageDTO chatMessageDto = objectMapper.readValue(new String(message.getBody(),"utf-8"), ChatMessageDTO.class);
        
        System.out.println("Redis Channel: " + chatMessageDto.getRoomId()+"  And 받은 메시지: " + chatMessageDto.getContent());

        // chatMessageDto를 다시 json형태로 만들어서 보내줘야함.(직렬화)
        String jsonSend = objectMapper.writeValueAsString(chatMessageDto);

        //ChatserverEndPoint 문 있어야함 >>>>>>
        // ChatserverEndPoint.broadcastTosession(chatMessageDto.getRoomId(),jsonSend); 
        //<<<<<<
    } 
    catch (Exception e) {
        e.printStackTrace();
    }
}
    
}
