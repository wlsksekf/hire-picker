// 'use client'는 이 컴포넌트가 클라이언트 측에서 렌더링되고 상호작용됨을 명시해.
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Avatar, TextField, CircularProgress, Paper, Stack, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh'; // 새로고침 아이콘 추가
import { api } from '../api';

// 개별 채팅 메시지를 렌더링하는 컴포넌트
const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';
  return (
    <Box sx={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', mb: 2 }}>
      {isBot && <Avatar src="/picky.png" sx={{ width: 32, height: 32, mr: 1.5, alignSelf: 'flex-start' }} />}
      <Paper
        elevation={0}
        sx={{
          p: '12px 16px',
          backgroundColor: isBot ? '#f0f4f8' : 'primary.main',
          color: isBot ? 'text.primary' : 'primary.contrastText',
          borderRadius: isBot ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
          maxWidth: '85%',
          wordBreak: 'break-word',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{message.text}</Typography>
      </Paper>
    </Box>
  );
};

// 재사용 가능한 채팅창 UI 컴포넌트
const ChatWindow = ({ open, onClose, endpoint, title, initialMessage }) => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: initialMessage }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null); // 세션 ID 상태 추가
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 대화 새로고침 핸들러
  const handleRefresh = () => {
    setMessages([{ sender: 'bot', text: initialMessage }]);
    setSessionId(null);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 요청 시 sessionId 포함
    api.post(endpoint, { prompt: input, sessionId })
      .then(response => {
        const { text, sessionId: newSessionId } = response.data;
        const botMessage = { sender: 'bot', text };
        setMessages(prev => [...prev, botMessage]);
        setSessionId(newSessionId); // 응답 받은 세션 ID로 업데이트
      })
      .catch(error => {
        console.error(`[${title}] 챗봇 응답을 가져오는 데 실패했습니다.`, error);
        const errorMessage = { sender: 'bot', text: '죄송해요, 답변을 생성하는 중 오류가 발생했어요.' };
        setMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, border: 'none', boxShadow: '0 8px 40px -12px rgba(0,0,0,0.2)' } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'white' }}>
        {/* 헤더 */}
        <Box sx={{ p: '12px 16px', flexShrink: 0, borderBottom: '1px solid #e0e0e0' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{title}</Typography>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Stack>
        </Box>

        {/* 메시지 목록 */}
        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', bgcolor: '#f9fafb' }}>
          {messages.map((msg, index) => <ChatMessage key={index} message={msg} />)}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
              <Avatar src="/picky.png" sx={{ width: 32, height: 32, mr: 1.5, alignSelf: 'flex-start' }} />
              <Paper elevation={0} sx={{ p: '12px 16px', bgcolor: '#f0f4f8', borderRadius: '20px 20px 20px 4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <CircularProgress size={20} />
              </Paper>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Box>

        {/* 메시지 입력창 */}
        <Box sx={{ p: 2, flexShrink: 0, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="대화 새로고침">
              <IconButton color="primary" onClick={handleRefresh} disabled={isLoading} sx={{ width: 48, height: 48, '&:hover': { bgcolor: 'action.hover' } }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  bgcolor: '#f9fafb',
                  '& fieldset': {
                    border: '1px solid #e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
            <IconButton color="primary" onClick={handleSend} disabled={isLoading} sx={{ bgcolor: 'primary.main', color: 'white', width: 48, height: 48, '&:hover': { bgcolor: 'primary.dark' } }}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatWindow;