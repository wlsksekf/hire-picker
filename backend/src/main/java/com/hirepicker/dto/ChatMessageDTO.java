package com.hirepicker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter@NoArgsConstructor@AllArgsConstructor@Builder
public class ChatMessageDTO {
    // type은 talk, enter, exit 구분위한거임
    private String type, roomId, senderName, content, timestamp;

}
