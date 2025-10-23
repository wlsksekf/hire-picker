package com.hirepicker.config.redis; // (패키지는 그대로 두세요)

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

import org.springframework.web.socket.server.standard.ServerEndpointExporter;

import com.hirepicker.service.RedisSubScriber;

@Configuration
public class WebSocketConfig {
    @Bean
    public ServerEndpointExporter serverEndpointExporter(){
        return new ServerEndpointExporter();
    }
    @Bean
    public RedisMessageListenerContainer redisMessageListener(
            RedisConnectionFactory connectionFactory, 
            RedisSubScriber subscriber) { 
        
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        
        // [수정 4]
        // 어댑터가 아닌, 실제 리스너(subscriber)를 "chat-room:*"에 등록.
        container.addMessageListener(subscriber, new PatternTopic("chat-room:*")); 
        
        return container;
    }

}