// frontend/src/app/mypage/payment-success/page.js
"use client";
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../store/authStore'; // 경로 수정

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
`;

const SuccessMessage = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const RedirectButton = styled.button`
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
`;

const PaymentSuccessPage = () => {
  const router = useRouter();
  // Zustand 스토어의 updateUserCredits 함수를 사용한다고 가정합니다.
  // 실제 스토어 구조에 맞게 수정해야 합니다.
  // const { updateUserCredits } = useAuthStore(); 

  useEffect(() => {
    // URL에서 결제 정보를 파싱합니다.
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');

    if (amount) {
      // 백엔드에 결제 승인 요청을 보내고, 성공 시 크레딧을 업데이트합니다.
      // 예시: updateUserCredits(parseInt(amount, 10));
      console.log(`${amount}원 결제가 승인되었습니다.`);
    }
  }, []);

  return (
    <SuccessContainer>
      <SuccessMessage>결제가 성공적으로 완료되었습니다!</SuccessMessage>
      <InfoText>크레딧이 충전되었습니다. 상점으로 돌아갑니다.</InfoText>
      <RedirectButton onClick={() => router.push('/store')}>상점으로 돌아가기</RedirectButton>
    </SuccessContainer>
  );
};

export default PaymentSuccessPage;
