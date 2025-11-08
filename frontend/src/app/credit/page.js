// frontend/src/app/credit/page.js
'use client';
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import CreditProductCard from "@/components/CreditProductCard";
import ClawToggle from "@/components/ClawToggle";
import ClawButton from "@/components/ClawButton";

import { getCreditBalance } from '@/api';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation'; // useRouter 임포트

// 전체 컨테이너
const StoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 72px 24px 96px;
  min-height: 100vh;
  background: #f7f8fb;
`;

const ContentWrapper = styled.div`
  width: min(920px, 100%);
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

// 헤더 영역
const HeaderSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #1c2a4a;
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.05rem;
  color: #667299;
  line-height: 1.55;
`;

const BalanceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  padding: 18px 26px;
  border-radius: 16px;
  border: 1px solid #e3e7f1;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1c2a4a;
  box-shadow: 0 12px 30px rgba(28, 42, 74, 0.05);

  span {
    font-size: 0.95rem;
    font-weight: 500;
    color: #7b88a8;
  }
`;

// 카드 영역
const CardSection = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e5e8ef;
  padding: 36px clamp(20px, 5vw, 48px);
  box-shadow: 0 20px 40px rgba(28, 42, 74, 0.08);
`;

const CoinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: clamp(24px, 5vw, 40px);
  justify-items: center;
`;

// 버튼
const PurchaseButton = styled.button`
  align-self: center;
  margin-top: 12px;
  background: #1c63ff;
  color: #ffffff;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 14px 24px rgba(28, 99, 255, 0.18);

  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 18px 28px rgba(28, 99, 255, 0.24);
  }

  &:disabled {
    background: #c9d4ef;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  position: relative;
  z-index: 2;
  margin-top: 12px;
`;

const Joystick = styled.div`
  position: relative;
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: #e9edf5;
  border: 1px solid #d9deea;
  display: grid;
  place-items: center;

  &::before {
    content: '';
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #ffffff;
    border: 1px solid #c6ccda;
  }
`;

const ControlButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const creditOptions = [
  {
    id: "CREDIT_10K",
    title: "스타터 코인팩",
    credits: 10000,
    price: 10000,
    description: "입문자를 위한 기본 충전",
    badge: "NEW",
    accent: "#1c63ff",
    imageVariant: "single",
  },
  {
    id: "CREDIT_50K",
    title: "프로 코인팩",
    credits: 50000,
    price: 45000,
    description: "10% 혜택으로 넉넉하게",
    badge: "BEST",
    accent: "#2563eb",
    imageVariant: "stack",
  },
  {
    id: "CREDIT_100K",
    title: "언리미티드 코인팩",
    credits: 100000,
    price: 70000,
    description: "가장 많이 찾는 할인 구성",
    badge: "HOT",
    accent: "#0ea5e9",
    imageVariant: "bundle",
  },
];

const StorePage = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [userCredits, setUserCredits] = useState(0);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter(); // useRouter 훅 사용

  // 크레딧 잔액 조회
  useEffect(() => {
    if (isAuthenticated) {
      getCreditBalance().then(setUserCredits);
    }
  }, [isAuthenticated]);

  const handleCardClick = (cardId) => {
    setSelectedCard(cardId);
  };

  const handlePayment = () => {
    if (!selectedCard) {
      alert('상품을 선택해주세요.');
      return;
    }
    // 선택된 상품 ID를 가지고 Checkout 페이지로 이동
    router.push(`/credit/checkout?productId=${selectedCard}`);
  };

  return (
    <StoreContainer>
      <ContentWrapper>
        <HeaderSection>
          <Title>HirePicker Credits</Title>
          <Subtitle>간결하고 직관적인 토큰 충전. 필요한 만큼 코인을 쌓아두고 필요한 순간에 사용하세요.</Subtitle>
          {isAuthenticated && (
            <BalanceBadge>
              <span>보유 크레딧</span>
              {userCredits.toLocaleString()} C
            </BalanceBadge>
          )}
        </HeaderSection>

        <CardSection>
          <CoinGrid>
            {creditOptions.map((option) => (
              <CreditProductCard
                key={option.id}
                {...option}
                selected={selectedCard === option.id}
                onClick={() => handleCardClick(option.id)}
              />
            ))}
          </CoinGrid>

          <PurchaseButton onClick={handlePayment} disabled={!isAuthenticated || !selectedCard}>
            {isAuthenticated ? '크레딧 결제하기' : '로그인이 필요합니다'}
          </PurchaseButton>

          <ControlsSection>
            <ClawToggle />
            <ControlButtons>
              <ClawButton variant="red" ariaLabel="confirm" />
              <ClawButton variant="blue" ariaLabel="cancel" />
            </ControlButtons>
          </ControlsSection>
        </CardSection>
      </ContentWrapper>
    </StoreContainer>
  );
};

export default StorePage;
