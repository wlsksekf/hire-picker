"use client"

import { Box, Modal, Paper, Stack, Typography } from "node_modules/@mui/material";
import { useEffect, useRef, useState } from "react"

function ChatRoom({postId,onClose}){

    const [messages,setMessages]=useState([]);
    const [newMessage, setNewMessage] = useState('');
    const websocket = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(function(){

        // postId 없으면 리턴.
        if(!postId)
            return;

        // 선택한 채용공고의 웹소켓 URL
        const ws = new WebSocket(`ws://localhost:8080/chat/${postId}`)

        ws.onopen = function(){
            console.log(`${postId} 채팅방 연결`)
        }

        ws.onmessage = function(event){
            setMessages(function(prevMessages){
                return[...prevMessages, event.data]; // prevMessage를 복사해서 event.data를 추가해라.
            });
        }


        ws.onclose = function() {
        console.log(`채팅방 [${postId}] 연결 끊김`);
        };

        websocket.current= ws // ws 를 지역변수에 넣어주자.

        return function cleanup(){
            ws.close();
        };

    },[postId]); // jobId가 바뀔 때마다.

    useEffect(function(){
        messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
    },[messages])

    const handleSendMessage = function(){
        if(websocket.current && newMessage.trim() !== ""){
            websocket.current.send(newMessage);
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
        <Modal open={true} onClose={onclose} aria-labelledby="modal-title">
            <Box>
                <Typography id="modal-title" variant="h6" component="h2">
                    채팅방: {postId}
                </Typography>

                <Paper>
                    <Stack>
                        {messages.map(function(msg, idx){
                            return<Typography key={idx} variant="body1">{msg}</Typography>;
                        })}
                            <div ref={messagesEndRef}/>
                    </Stack>
                </Paper>
            </Box>

        </Modal>
    )


}

export default ChatRoom