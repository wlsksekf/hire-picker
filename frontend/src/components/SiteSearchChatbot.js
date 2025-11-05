'use client';

import React, { useState } from 'react';
import { Fab, Avatar } from '@mui/material';
import ChatWindow from './ChatWindow';

const SiteSearchChatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Fab
        aria-label="open site search chatbot"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: 'white',
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)',
        }}
      >
        <Avatar src="/picky.png" sx={{ width: 56, height: 56 }} />
      </Fab>

      <ChatWindow
        open={open}
        onClose={() => setOpen(false)}
        endpoint="/api/v1/ai-chat"
        title="사이트 정보 검색"
        initialMessage="안녕하세요! Hire-Picker 사이트의 정보에 대해 무엇이든 물어보세요. 예: React 채용 공고 찾아줘"
      />
    </>
  );
};

export default SiteSearchChatbot;
