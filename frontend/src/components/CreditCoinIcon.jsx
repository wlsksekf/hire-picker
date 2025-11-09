"use client";

import React from "react";
import styled, { keyframes } from "styled-components";

// Tailwind `animate-bounce` 대체용 키프레임 정의
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20%); }
`;

// 동전 컨테이너: 기존 Tailwind 클래스(border, rounded, flex 등)와 동일 효과 적용
const Coin = styled.div`
  width: 32px; /* w-8 */
  height: 32px; /* aspect-square + w-8 */
  display: flex; /* flex */
  align-items: center; /* items-center */
  justify-content: center; /* justify-center */
  border-radius: 999px; /* rounded-full */
  border-right: 2px solid #d97706; /* border-r-2 + yellow-500 */
  border-top: 2px solid #d97706;
  border-bottom: 2px solid #d97706;
  border-left: 2px solid #fbbf24;
  background-color: #facc15; /* bg-yellow-300 */
  color: #a16207; /* text-yellow-700 */
  font-weight: 700;
  animation: ${bounce} 1.5s infinite ease-in-out; /* animate-bounce */
  position: relative;
  z-index: 20; /* 조이스틱/카드 위에 표시 */
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
`;

const CreditCoinIcon = () => {
  return <Coin>C</Coin>;
};

export default CreditCoinIcon;
