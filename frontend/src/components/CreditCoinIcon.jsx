"use client";

import React from "react";
import styled, { keyframes } from "styled-components";

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

const CoinWrapper = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${bounce} 1.6s ease-in-out infinite;
`;

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

const CreditCoinIcon = () => {
  return (
    <CoinWrapper>
      <Coin>₩</Coin>
    </CoinWrapper>
  );
};

export default CreditCoinIcon;
