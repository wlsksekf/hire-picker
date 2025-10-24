// frontend/src/app/mypage/payment-fail/page.js
"use client";
import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

const FailContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
`;

const FailMessage = styled.h1`
  color: #e74c3c; /* Red color for error */
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const RedirectButton = styled.button`
  background-color: ${({ theme }) => theme.palette.primary.main}; /* Red color for error */
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

const PaymentFailPage = () => {
  const router = useRouter();

  // URL에서 에러 정보를 파싱할 수 있습니다.
  // const urlParams = new URLSearchParams(window.location.search);
  // const code = urlParams.get('code');
  // const message = urlParams.get('message');

  return (
    <FailContainer>
      <FailMessage>결제가 실패하였습니다.</FailMessage>
      <InfoText>결제 과정에서 오류가 발생했습니다. 다시 시도해주세요.</InfoText>
      {/* {code && message && <InfoText>오류 코드: {code}, 메시지: {message}</InfoText>} */}
      <RedirectButton onClick={() => router.push('/store')}>상점으로 돌아가기</RedirectButton>
    </FailContainer>
  );
};

export default PaymentFailPage;
