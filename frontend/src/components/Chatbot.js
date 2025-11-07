'use client';

import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Avatar,
  Box,
} from '@mui/material';
import ChatWindow from './ChatWindow';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';

// 메인 버튼 클릭 시 펼쳐지는 애니메이션을 위한 스타일 정의
const StyledWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop),
})`
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1100;

  .buttons {
    position: relative;
    display: grid;
    place-items: center;
    height: fit-content;
    width: fit-content;
    transition: 0.3s;
    border-radius: 50%;
  }

  .main-button {
    position: relative;
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border: none;
    background: #ffffff;
    box-shadow: 0 4px 12px 0 rgba(0,0,0,0.15);
    border-radius: 50%;
    transition: 0.2s;
    z-index: 100;
    cursor: pointer;
  }

  .button {
    position: absolute;
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border: none;
    background: #e8e8e8;
    box-shadow: 5px 5px 12px rgba(202, 202, 202, 0), -5px -5px 12px rgba(255, 255, 255, 0);
    transition: 0.3s;
    border-radius: 50%;
    cursor: pointer;
    color: #333;
  }

  .site-search-button:hover {
    background: #66bb6a; // Green
    color: white;
  }

  .web-search-button:hover {
    background: #42a5f5; // Blue
    color: white;
  }

  // isOpen 상태일 때 버튼 펼침
  ${({ isOpen }) => isOpen && css`
    .buttons {
      padding: 60px;
    }
    .button {
      box-shadow: 5px 5px 12px #cacaca, -5px -5px 12px #ffffff;
    }
    .site-search-button {
      translate: 0px -70px; /* 위로 */
    }
    .web-search-button {
      translate: -70px 0px; /* 왼쪽으로 */
    }
  `}
`;

const Chatbot = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteChatOpen, setSiteChatOpen] = useState(false);
  const [webChatOpen, setWebChatOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openSiteChat = () => {
    setSiteChatOpen(true);
    setIsMenuOpen(false);
  };

  const openWebChat = () => {
    setWebChatOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <StyledWrapper isOpen={isMenuOpen}>
        <div className="buttons">
          <button className="main-button" onClick={handleMenuToggle}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar src="/picky.png" sx={{ width: 56, height: 56, transform: 'translateX(-5px)' }} />
            </Box>
          </button>
          <button className="site-search-button button" onClick={openSiteChat}>
            <SearchIcon />
          </button>
          <button className="web-search-button button" onClick={openWebChat}>
            <LanguageIcon />
          </button>
        </div>
      </StyledWrapper>

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
