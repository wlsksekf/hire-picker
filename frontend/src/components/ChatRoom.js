"use client"

import { Box, Button, Modal, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
// [1. Import] stompjs 라이브러리
import { Client } from '@stomp/stompjs';
import axios from "axios";

// 모달 스타일 (동일)
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 480,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  height: '70vh',
  borderRadius:"15px"
};

function ChatRoom({ post, onClose }) {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // [2. useRef] stompClient 객체를 유지하기 위해 사용
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);

  

  // [3. useEffect] - 방 입장 및 WebSocket 연결
  useEffect(function() {
    if (!post.id) return;

    // --- STOMP 클라이언트 설정 ---
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws", // WebSocketConfig의 엔드포인트
      
      // [4. 연결 성공 시 실행될 *이름있는* 함수]
      onConnect: handleStompConnect,

      onStompError: function(frame) {
        console.error('STOMP 에러:', frame);
      },
      debug: function (str) {
        console.log(str);
      },
    });

    // [5. 구독 콜백을 위한 *이름있는* 함수]
    function handleStompConnect() {
      console.log("STOMP 서버에 연결되었습니다!");

      // 구독 시작
      stompClient.subscribe(
        `/topic/room/${post.id}`, // RedisSubscriber가 메시지를 보낼 주소
        handleNewMessage // 메시지 수신 시 실행될 *이름있는* 함수
      );
      
      // (선택) 입장 메시지 발행
      // handleSend("ENTER", "박재윤님이 입장했습니다.");
    }

    // [6. 메시지 수신 시 실행될 *이름있는* 함수]
    function handleNewMessage(message) {
      const receivedMessage = JSON.parse(message.body);
      
      // 람다 대신 일반 함수 사용
      setMessages(function(prevMessages) {
        return [...prevMessages, receivedMessage];
      });
    }

      // --- [1. 수정] axios.get()으로 과거 기록 불러오기 ---
    axios.get(`http://localhost:8080/chat/history/${post.id}`)
      .then(function(response) {
        // axios는 response.data에 JSON 데이터가 바로 들어있습니다.
        
        // [성공] API로 불러온 과거 기록을 state에 세팅
        setMessages(response.data); 
        // [7. 연결 활성화]
        stompClient.activate();
        clientRef.current = stompClient; // 나중에 쓸 수 있게 저장
      })
      .catch(function(error) {
        // [실패] 에러 처리
        console.error("과거 기록 API 호출 중 에러:", error);
      });


    // [8. 컴포넌트 종료 시 실행될 함수]
    return function cleanup() {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log("STOMP 연결이 종료되었습니다.");
      }
    };

  }, [post.id]); // postId가 바뀔 때마다 재연결

  // [9. 새 메시지 올 때마다 스크롤]
  useEffect(function() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // [10. 메시지 발송 함수]
  function handleSendMessage() {
    const stompClient = clientRef.current;
    
    if (!stompClient || !stompClient.connected || newMessage.trim() === "") {
      return; 
    }

    const messageDto = {
      type: "TALK",
      roomId: post.id,
      content: newMessage,
      senderName: "누군가.." // (TODO: 실제 로그인된 유저 이름)
    };

    // ChatController의 @MessageMapping("/chat.sendMessage")로 발행
    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(messageDto)
    });

    setNewMessage(""); // 입력창 비우기
  }

  // [11. 입력창 변경 핸들러]
  function handleMessageChange(e) {
    setNewMessage(e.target.value);
  }

  // [12. 엔터키 핸들러]
  function handleEnter(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  // --- [이하 JSX 렌더링] ---
  // (보여주신 JSX 구조를 거의 그대로 사용)
  return (
    <Modal open={true} onClose={onClose} aria-labelledby="modal-title">
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2">
          기업: {post.companyName}<br/>{post.title}
        </Typography>
        
        <Paper elevation={2} sx={{ flexGrow: 1, my: 2, p: 2, overflowY: 'auto' }}>
          <Stack spacing={1}>
            {messages.map(function(msg, idx) { // 람다 대신 function
              // 입장/퇴장 메시지
              if (msg.type === "ENTER" || msg.type === "LEAVE") {
                return (
                  <Typography key={idx} variant="body2" sx={{ textAlign: 'center', color: 'gray' }}>
                    {msg.content}
                  </Typography>
                );
              }
              // 일반 대화
              return (
                <Typography key={idx} variant="body1">
                  <strong>{msg.senderName}:</strong> {msg.content}
                </Typography>
              );
            })}
            <div ref={messagesEndRef} />
          </Stack>
        </Paper>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={newMessage}
            onChange={handleMessageChange} // [11] 핸들러 연결
            onKeyDown={handleEnter}       // [12] 핸들러 연결
            placeholder="메시지 입력해라"
          />
          <Button variant="contained" onClick={handleSendMessage}> {/* [10] 핸들러 연결 */}
            전송
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ChatRoom;