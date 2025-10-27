package com.hirepicker.config.redis; // (패키지 경로는 본인에 맞게)

import com.hirepicker.service.RedisSubScriber;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // [핵심] Spring WebSocket 메시지 브로커를 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * STOMP WebSocket 연결을 위한 엔드포인트를 등록합니다.
     * 클라이언트(프론트)가 최초로 연결할 주소입니다.
     */
    @SuppressWarnings("null")
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // (예시) 클라이언트가 접속할 주소: ws://.../ws
                .setAllowedOriginPatterns("*"); // CORS 문제 해결 (나중에 실제 도메인으로 변경)
                // .withSockJS(); // (선택) SockJS를 사용하려면 주석 해제
    }

    /**
     * 메시지 브로커(중계소) 설정을 합니다.
     */
    @SuppressWarnings("null")
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // [1] /topic, /queue (브로드캐스트)
        // 클라이언트가 "구독(subscribe)"할 주소의 prefix입니다.
        // /topic/room/123 처럼 사용됩니다.
        // 나중에 여기를 통해 1:1 "private" 구독주소를 따로 추가해도 된ㄷ.
        registry.enableSimpleBroker("/topic");

        // [2] /app (메시지 수신)
        // 클라이언트가 "발행(send)"할 주소의 prefix입니다.
        // /app/chat.sendMessage 처럼 사용됩니다.
        registry.setApplicationDestinationPrefixes("/app");
    }

    // --- [유지] Redis 구독자 설정은 그대로 둡니다 ---
    
    @Bean
    public RedisMessageListenerContainer redisMessageListener(
            RedisConnectionFactory connectionFactory, 
            RedisSubScriber subscriber) { 
        
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        // "chat-room:"으로 시작하는 모든 채널을 구독 (이건 그대로 둠)
        container.addMessageListener(subscriber, new PatternTopic("chat-room:*")); 
        return container;
    }

}