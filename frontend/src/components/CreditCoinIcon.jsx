"use client";

import React from "react";
import styled, { keyframes } from "styled-components";

// 부드럽게 위아래로 움직이는 애니메이션 정의
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

// 코인 아이콘 전체 래퍼(애니메이션 적용)
const CoinWrapper = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${bounce} 1.6s ease-in-out infinite;
`;

// 실버 코인 스타일: 테두리, 그림자, 텍스트 모두 중앙 정렬
const Coin = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: #d9dce4;
  border: 2px solid #b5bcc9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5b6374;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 4px 8px rgba(43, 54, 72, 0.08);
`;

// 크레딧 금액을 시각적으로 보여주는 간단한 코인 아이콘 컴포넌트
const CreditCoinIcon = () => {
  return (
    <CoinWrapper>
      <Coin>₩</Coin>
    </CoinWrapper>
  );
};

export default CreditCoinIcon;
