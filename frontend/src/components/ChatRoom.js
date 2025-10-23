"use client"

import { Box, Button, Modal, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react"

// 모달 스타일
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

function ChatRoom({post, onClose}){

    const [messages,setMessages]=useState([]);
    const [newMessage, setNewMessage] = useState('');
    const websocket = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(function(){
        
        // post 정보 받지 않았다면 리턴.
        if(!post.id)
            return;
        console.log(post);
        // 선택한 채용공고의 웹소켓 URL
        const ws = new WebSocket(`ws://localhost:8080/chat/${post.id}`)

        ws.onopen = function(){
            console.log(`${post.title} 채팅방 연결`)
        }

        ws.onmessage = function(event){
            const dto =JSON.parse(event.data)
            setMessages(function(prevMessages){
                return[...prevMessages, dto]; // prevMessage를 복사해서 event.data를 추가해라.
            });
        }


        ws.onclose = function() {
        console.log(`채팅방 [${post.title}] 연결 끊김`);
        };

        websocket.current= ws // ws 를 지역변수에 넣어주자.

        return function cleanup(){
            ws.close();
        };

    },[post.id]); // jobId가 바뀔 때마다.

    useEffect(function(){
        messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
    },[messages])

    const handleSendMessage = function(){
        if(websocket.current && newMessage.trim() !== ""){
            const dto = {
                type: "TALK",
                roomId: post.id,
                senderName: "TEMP_USER", // (어차피 서버가 덮어쓸 예정)
                content: newMessage,
                timestamp: new Date().toISOString() // (어차피 서버가 덮어쓸 예정)
            };
            websocket.current.send(JSON.stringify(dto));
            setNewMessage("");
        }
    };

    const handleEnter = function(e){
        if(e.key =="Enter" && !e.shiftKey){
            e.preventDefault();
            handleSendMessage();
        }
    };

    return(
        <Modal open={true} onClose={onClose} aria-labelledby="modal-title">
            <Box sx={style}>
                <Typography id="modal-title" variant="h6" component="h2">
                    기업: {post.companyName}<br/>{post.title}
                </Typography>
                    {/* evaluation:그림자?, flexGrow:부모의 남는공간차이, my :margin, p:padding, overflow:스크롤바 자동생성  */}
                <Paper elevation={2} sx={{ flexGrow: 1, my: 2, p: 2, overflowY: 'auto' }}>
                    <Stack spacing={1}>
                        {messages.map(function(msg, idx){
                            // msg는 이제 DTO 객체입니다.

                            // 입장/퇴장 메시지 처리
                            if (msg.type === "ENTER" || msg.type === "LEAVE") {
                                return (
                                    <Typography key={idx} variant="body2" sx={{ textAlign: 'center', color: 'gray' }}>
                                        {msg.content} {/* 예: "익명123님이 입장했습니다." */}
                                    </Typography>
                                );
                            }

                            // 일반 대화(TALK) 메시지 처리
                            return (
                                <Typography key={idx} variant="body1">
                                    <strong>{msg.senderName}:</strong> {msg.content}
                                </Typography>
                            );
                        })}
                            <div ref={messagesEndRef}/>
                    </Stack>
                </Paper>
                <Box sx={{display:'flex',gap: 1}}>
                    <TextField
                    fullWidth
                    variant="outlined"
                    value={newMessage}
                    onChange={function(e){setNewMessage(e.target.value);}}
                    onKeyDown={handleEnter}
                    placeholder="메시지 입력해라"/>

                    <Button variant="contained" onClick={handleSendMessage}>전송</Button>
                </Box>
            </Box>

        </Modal>
    )


}

export default ChatRoom