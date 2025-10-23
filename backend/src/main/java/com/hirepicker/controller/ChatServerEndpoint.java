package com.hirepicker.controller; // (패키지 경로는 본인에 맞게 수정)

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hirepicker.config.redis.ServerEndpointConfigurator; // (경로 확인)
import com.hirepicker.dto.ChatMessageDTO; // (경로 확인)
import com.hirepicker.entity.ChatMessage; // (경로 확인)
import com.hirepicker.repository.ChatMessageRepository; // (경로 확인)
import com.hirepicker.service.RedisPublisher; // (경로 확인)

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import lombok.RequiredArgsConstructor; // (Lombok 임포트)
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@ServerEndpoint(value = "/chat/{postId}", configurator = ServerEndpointConfigurator.class)
@RequiredArgsConstructor // final 필드 주입을 위해 사용
public class ChatServerEndpoint {

    // [static] 이 서버 인스턴스에 연결된 세션 관리 (broadcastToSessions에서 사용)
    private static final Map<String, Set<Session>> roomSessions = new ConcurrentHashMap<>();
    
    // [non-static] Spring DI를 통해 주입 (Configurator가 처리)
    private final ChatMessageRepository chatMessageRepository;
    private final RedisPublisher redisPublisher;

    // [static] JSON 변환기
    private static final ObjectMapper objectMapper = new ObjectMapper();


    @OnOpen
    public void onOpen(Session session, @PathParam("postId") String postId) {
        roomSessions.computeIfAbsent(postId, key -> Collections.synchronizedSet(new HashSet<>())).add(session);
        System.out.println("[WebSocket] Client connected in room: " + postId + " (Session: " + session.getId() + ")");

        try {
            List<ChatMessage> history = chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(postId);

            for (ChatMessage msg : history) {
                ChatMessageDTO historyDto = new ChatMessageDTO(
                        "TALK", 
                        msg.getRoomId(),
                        msg.getSender(), 
                        msg.getContent(),
                        msg.getCreatedAt().toString() 
                );
                String jsonMessage = objectMapper.writeValueAsString(historyDto);
                session.getBasicRemote().sendText(jsonMessage);
            }

            String senderId = "익명의 사용자" + session.getId();
            ChatMessageDTO enterDto = new ChatMessageDTO(
                    "ENTER",
                    postId,
                    senderId,
                    senderId + "님이 입장했습니다.",
                    LocalDateTime.now().toString()
            );

            // [수정 완료] DTO만 넘겨줍니다.
            redisPublisher.publish(enterDto);

        } catch (IOException e) {
            System.err.println("Error onOpen: " + e.getMessage());
        }
    }

    @OnMessage
    public void onMessage(String message, Session session, @PathParam("postId") String postId) {
        try {
            ChatMessageDTO receivedDto = objectMapper.readValue(message, ChatMessageDTO.class);
            
            String senderId = "익명의 사용자" + session.getId();
            LocalDateTime now = LocalDateTime.now();

            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setRoomId(postId); // (DB 저장용 roomId 설정)
            chatMessage.setSender(senderId); 
            chatMessage.setContent(receivedDto.getContent());
            chatMessage.setCreatedAt(now); 
            chatMessageRepository.save(chatMessage);

            // Redis로 보낼 DTO 정보 설정
            receivedDto.setType("TALK");
            receivedDto.setRoomId(postId);
            receivedDto.setSenderName(senderId); 
            receivedDto.setTimestamp(now.toString()); 

            // [수정 완료] DTO만 넘겨줍니다.
            redisPublisher.publish(receivedDto);

        } catch (IOException e) {
            System.err.println("Error onMessage: " + e.getMessage());
        }
    }

    @OnClose
    public void onClose(Session session, @PathParam("postId") String postId) {
        roomSessions.getOrDefault(postId, Collections.emptySet()).remove(session);
        System.out.println("[WebSocket] Client disconnected from room: " + postId + " (Session: " + session.getId() + ")");

        String senderId = "익명의 사용자" + session.getId();
        ChatMessageDTO exitDto = new ChatMessageDTO(
                "LEAVE",
                postId,
                senderId,
                senderId + "님이 퇴장했습니다.",
                LocalDateTime.now().toString()
        );

        // [수정 완료] DTO만 넘겨줍니다.
        redisPublisher.publish(exitDto);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("WebSocket Error for Session " + session.getId() + ": " + throwable.getMessage());
        throwable.printStackTrace();
    }

    

    public static void broadcastToSessions(String postId, String jsonMessage) {
        Set<Session> sessions = roomSessions.get(postId);
        if (sessions == null) return;

        synchronized (sessions) {
            for (Session s : sessions) {
                if (s.isOpen()) {
                    try {
                        s.getBasicRemote().sendText(jsonMessage);
                    } catch (IOException e) {
                        System.err.println("Error broadcasting message to session " + s.getId() + ": " + e.getMessage());
                    }
                }
            }
        }
    }
}