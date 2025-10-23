package com.hirepicker.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.hirepicker.dto.ChatMessageDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RedisPublisher{
    // Object는 >> json 형태로 들어옴. 
    private final RedisTemplate<String,Object> redisTemplate;

    public void publish(ChatMessageDTO messageDTO){
        String channel = "chat-room:" + messageDTO.getRoomId();

        // RedisSubScriver의 Message로 전달.
        redisTemplate.convertAndSend(channel, messageDTO);
    }
}
