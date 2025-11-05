'use client';

import React, { useState } from 'react';
import { Fab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChatWindow from './ChatWindow';

const WebSearchChatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        aria-label="open web search chatbot"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 108, // Positioned to the left of the other FAB
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': { backgroundColor: 'primary.dark' },
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)',
        }}
      >
        <SearchIcon />
      </Fab>

      <ChatWindow
        open={open}
        onClose={() => setOpen(false)}
        endpoint="/api/v1/ai-search"
        title="웹 검색"
        initialMessage="안녕하세요! 웹 검색을 통해 무엇이든 물어보세요. 예: 2025년 프론트엔드 기술 트렌드 알려줘"
      />
    </>
  );
};

export default WebSearchChatbot;
