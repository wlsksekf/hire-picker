package com.hirepicker.controller; // (패키지 경로는 본인에 맞게)

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.hirepicker.dto.ChatMessageDTO;
import com.hirepicker.entity.ChatMessage;
import com.hirepicker.repository.ChatMessageRepository;
import com.hirepicker.service.RedisPublisher;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Tag(name = "채팅", description = "채팅 관련 API")
@RestController
@RequiredArgsConstructor // [핵심] 그냥 Lombok으로 주입받으면 끝! Configurator 불필요.
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisPublisher redisPublisher;
    // (SimpMessagingTemplate은 여기서 필요 없음. Subscriber가 대신 처리)

    /**
     * 클라이언트가 /app/chat.sendMessage 주소로 메시지를 보낼 때 이 메소드가 실행됩니다.
     */
    @MessageMapping("/chat.sendMessage") 
    public void sendMessage(ChatMessageDTO receivedDto, SimpMessageHeaderAccessor headerAccessor) {
        
        // (로그인 기능이 없으므로, 임시 senderId 사용. 
        //  나중에 Spring Security와 연동하면 실제 유저 ID를 가져올 수 있음)
        String senderId = receivedDto.getSenderName(); // (프론트가 보낸 이름을 일단 신뢰)
        if (senderId == null || senderId.isEmpty()) {
            String sessionId = headerAccessor.getSessionId();
            senderId = "픽붕이"+ (sessionId.substring(0, 2)); // 예: 앞 8자리만 사용;
        }
        
        LocalDateTime now = LocalDateTime.now();

        // 1. DB에 저장
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setRoomId(receivedDto.getRoomId());
        chatMessage.setSender(senderId); 
        chatMessage.setContent(receivedDto.getContent());
        chatMessage.setCreatedAt(now); 
        chatMessageRepository.save(chatMessage);

        // 2. DTO 정보 설정 (Redis로 보낼 정보)
        // (프론트가 이미 TALK, roomId, content, senderName을 줬다고 가정)
        receivedDto.setTimestamp(now.toString()); 
        receivedDto.setSenderName(senderId);

        // 3. Redis로 발행 (모든 서버의 Subscriber들에게 전송)
        redisPublisher.publish(receivedDto);
    }
    
    @Operation(summary = "채팅 내역 조회", description = "특정 채팅방의 이전 대화 내역을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "채팅 내역 조회 성공")
    })
    @GetMapping("/chat/history/{roomId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(@Parameter(description = "채팅방 ID", required = true) @PathVariable("roomId") String roomId) {
        
        // (경고: 이 코드는 '모든' 대화를 불러와서 느립니다. 
        //  이전에 논의했던 '페이징'을 적용해야 합니다.)
        List<ChatMessage> history = chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId); 
        
        // 엔티티 -> DTO로 변환
        List<ChatMessageDTO> dtos = new ArrayList<>();
        for(ChatMessage msg: history){
            ChatMessageDTO dto = ChatMessageDTO.builder()
                .type("TALK")
                .roomId(msg.getRoomId())
                .senderName(msg.getSender())
                .content(msg.getContent())
                .timestamp(msg.getCreatedAt()!=null ? msg.getCreatedAt().toString():null)
                .build();
                dtos.add(dto);
        }
        return ResponseEntity.ok(dtos);
    }
    
    /**
     * (참고) @OnOpen에서 하던 "입장 메시지" 로직은
     * @MessageMapping("/chat.addUser") 같은 걸 새로 만들거나,
     * STOMP의 "구독" 이벤트를 감지하는 리스너(@EventListener)를 만들어서 처리합니다.
     * * (참고) @OnOpen에서 하던 "과거 기록" 로딩은
     * 일반적인 @GetMapping API를 하나 만들어서, 클라이언트가 방에 입장할 때
     * WebSocket 연결과 별개로 HTTP GET 요청을 보내서 가져가도록 하는 것이 더 좋습니다.
     */
}