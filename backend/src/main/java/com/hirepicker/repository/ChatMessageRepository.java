package com.hirepicker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hirepicker.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage,Long>{
    List<ChatMessage> findByRoomIdOrderByCreatedAtAsc(String roomId);
    
}
