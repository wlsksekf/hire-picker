'use client';

import React, { useState } from 'react';
import {
  Fab,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ChatWindow from './ChatWindow';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';

const Chatbot = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [siteChatOpen, setSiteChatOpen] = useState(false);
  const [webChatOpen, setWebChatOpen] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openSiteChat = () => {
    setSiteChatOpen(true);
    handleMenuClose();
  };

  const openWebChat = () => {
    setWebChatOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <Fab
        aria-label="open chatbot menu"
        onClick={handleMenuClick}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={openSiteChat}>
          <ListItemIcon>
            <SearchIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>사이트 정보 검색</ListItemText>
        </MenuItem>
        <MenuItem onClick={openWebChat}>
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>웹 검색</ListItemText>
        </MenuItem>
      </Menu>

      <ChatWindow
        open={siteChatOpen}
        onClose={() => setSiteChatOpen(false)}
        endpoint="/api/v1/ai-chat"
        title="사이트 정보 검색"
        initialMessage="안녕하세요! Hire-Picker 사이트의 정보에 대해 무엇이든 물어보세요. 예: React 채용 공고 찾아줘"
      />

      <ChatWindow
        open={webChatOpen}
        onClose={() => setWebChatOpen(false)}
        endpoint="/api/v1/ai-search"
        title="웹 검색"
        initialMessage="안녕하세요! 웹 검색을 통해 무엇이든 물어보세요. 예: 2025년 프론트엔드 기술 트렌드 알려줘"
      />
    </>
  );
};

export default Chatbot;
