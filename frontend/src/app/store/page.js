"use client";
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';
import CreditCard from '../../components/CreditCard';
import CreditHistory from '../../components/CreditHistory';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import {
  animationDuration,
  grabberAnimation,
  grabbedItemVisibility,
  itemDisappear,
} from '../../theme/animations';

const TOSS_PAYMENTS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eun';

const StoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const ClawContainer = styled.div`
  position: absolute;
  top: 0px; /* SearchAnimation.js와 동일 */
  left: calc(50% + 500px); /* SearchAnimation.js와 동일 */
  transform: translateX(-50%);
  z-index: 2;
  animation: ${grabberAnimation} ${animationDuration} infinite forwards;
  width: 50px;
  height: 180px;

  &.left {
    left: calc(50% - 500px); /* 왼쪽 집게 위치 조정 */
    animation: ${grabberAnimation} ${animationDuration} infinite forwards 2s; /* 왼쪽 집게는 2초 지연 */
  }

  img {
    position: absolute; /* 명시적으로 추가 */
    width: 50px;
    height: 50px;
  }
`;

const FloorCoin = styled(FontAwesomeIcon)`
  position: absolute;
  bottom: 540px; /* SearchAnimation.js의 resume 위치와 유사하게 조정 */
  left: calc(50% + 440px); /* SearchAnimation.js의 resume 위치와 유사하게 조정 */
  transform: translateX(-50%); /* rotate(0deg) 제거 */
  width: 50px;
  height: 50px;
  z-index: 0;
  color: gold; /* 코인 색상 */
  animation: ${itemDisappear} ${animationDuration} infinite forwards;

  &.left {
    bottom: 530px; /* 왼쪽 코인 위치 조정 */
    left: calc(50% - 380px); /* 왼쪽 코인 위치 조정 */
    animation: ${itemDisappear} ${animationDuration} infinite forwards 2s; /* 왼쪽 코인은 2초 지연 */
  }
`;

const GrabbedCoin = styled(FontAwesomeIcon)`
  position: absolute;
  top: 40px; /* (수정) 50px -> 40px (줄어든 집게 크기에 맞춰 위로) */
  left: -2px; /* (수정) 15px -> 5px (줄어든 집게 너비에 맞춰 중앙 정렬) */
  width: 50px; /* (수정) 40px -> 50px */
  height: 50px; /* (수정) 40px -> 50px */
  color: gold; /* 코인 색상 */
  transform: rotate(5deg);
  animation: ${grabbedItemVisibility} ${animationDuration} infinite forwards;

  &.left {
    animation: ${grabbedItemVisibility} ${animationDuration} infinite forwards 2s; /* 왼쪽 코인은 2초 지연 */
  }
`;

const CreditBalance = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const PurchaseButton = styled.button`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.dark};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const creditOptions = [
  { id: 1, credits: 100, price: 1000, description: '맛보기 크레딧' },
  { id: 2, credits: 550, price: 5000, description: '보너스 10%!' },
  { id: 3, credits: 1200, price: 10000, description: '보너스 20%!' },
];

const StorePage = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [userCredits, setUserCredits] = useState(0); // 실제로는 API에서 가져와야 합니다.
  const [tossPayments, setTossPayments] = useState(null);

  useEffect(() => {
    loadTossPayments(TOSS_PAYMENTS_CLIENT_KEY).then(setTossPayments);
  }, []);

  const handleCardClick = (cardId) => {
    setSelectedCard(cardId);
  };

  const handlePayment = () => {
    if (!selectedCard || !tossPayments) return;

    const selectedOption = creditOptions.find(option => option.id === selectedCard);

    tossPayments.requestPayment('카드', {
      amount: selectedOption.price,
      orderId: `credit_${new Date().getTime()}`,
      orderName: `${selectedOption.credits} 크레딧 충전`,
      customerName: '테스트 유저', // 실제 유저 이름으로 변경해야 합니다.
      successUrl: `${window.location.origin}/mypage/payment-success`,
      failUrl: `${window.location.origin}/mypage/payment-fail`,
    });
  };

  return (
    <StoreContainer>
      <ClawContainer className="right">
        <img src="/claw.png" alt="Claw" style={{ position: 'absolute', top: '0px', left: '0px', width: '50px', height: '50px', objectFit: 'contain' }} />
        <GrabbedCoin icon={faSackDollar} />
      </ClawContainer>
      <ClawContainer className="left">
        <img src="/claw.png" alt="Claw" style={{ position: 'absolute', top: '0px', left: '0px', width: '50px', height: '50px', objectFit: 'contain' }} />
        <GrabbedCoin icon={faSackDollar} className="left" />
      </ClawContainer>
      <FloorCoin icon={faSackDollar} className="right" />
      <FloorCoin icon={faSackDollar} className="left" />
      
      <h1>크레딧 상점</h1>
      <CreditBalance>보유 크레딧: {userCredits} C</CreditBalance>

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

      <PurchaseButton onClick={handlePayment} disabled={!selectedCard}>
        결제하기
      </PurchaseButton>

      <CreditHistory />
    </StoreContainer>
  );
};

export default StorePage;