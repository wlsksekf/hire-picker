'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreditCard from '../../components/CreditCard';
import CreditHistory from '../../components/CreditHistory';
import { getCreditBalance } from '@/api';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation'; // useRouter 임포트

const StoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const CreditBalance = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
  background-color: #f0f0f0;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const PurchaseButton = styled.button`
  background-color: ${({ theme }) => theme?.palette?.primary?.main || '#0070f3'};
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1.5rem;

  &:hover {
    background-color: ${({ theme }) => theme?.palette?.primary?.dark || '#0050bb'};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const creditOptions = [
  { id: 'CREDIT_10K', credits: 10000, price: 10000, description: '기본 10,000 크레딧' },
  { id: 'CREDIT_50K', credits: 50000, price: 45000, description: '10% 할인!' },
  { id: 'CREDIT_100K', credits: 100000, price: 70000, description: '30% 할인!' },
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
    router.push(`/mypage/checkout?productId=${selectedCard}`);
  };

  return (
    <StoreContainer>
      <h1>크레딧 상점</h1>
      {isAuthenticated && (
        <CreditBalance>💰 보유 크레딧: {userCredits.toLocaleString()} C</CreditBalance>
      )}

      <CardContainer>
        {creditOptions.map(option => (
          <CreditCard
            key={option.id}
            {...option}
            isSelected={selectedCard === option.id}
            onClick={() => handleCardClick(option.id)}
          />
        ))}
      </CardContainer>

      <PurchaseButton onClick={handlePayment} disabled={!isAuthenticated || !selectedCard}>
        {isAuthenticated ? '결제하기' : '로그인이 필요합니다'}
      </PurchaseButton>

      {isAuthenticated && <CreditHistory />}
    </StoreContainer>
  );
};

export default StorePage;