// frontend/src/app/credit/checkout/CheckoutClient.js
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { initiateTossPayment } from '@/api';

const CheckoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const ProductInfo = styled.div`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PurchaseButton = styled.button`
  background-color: ${({ theme }) => theme?.palette?.primary?.main};
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1.5rem;

  &:hover {
    background-color: ${({ theme }) => theme?.palette?.primary?.dark};
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

const CheckoutClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [widgets, setWidgets] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null); // 백엔드로부터 받은 결제 정보

  // 1. URL에서 상품 정보 파싱
  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      const product = creditOptions.find(o => o.id === productId);
      if (product) {
        setSelectedProduct(product);
      } else {
        alert('유효하지 않은 상품입니다.');
        router.push('/credit');
      }
    } else {
      alert('상품 정보가 없습니다.');
      router.push('/credit');
    }
  }, [searchParams, router]);

  // 2. 상품 정보가 있으면, 백엔드에 결제 정보 요청
  useEffect(() => {
    if (!selectedProduct) return;

    initiateTossPayment(selectedProduct.id)
      .then(details => {
        setPaymentDetails(details);
      })
      .catch(error => {
        console.error('결제 정보 생성 중 오류 발생:', error);
        alert('결제 정보를 가져오는 중 오류가 발생했습니다.');
      });
  }, [selectedProduct]);

  // 3. 백엔드에서 결제 정보를 받아오면, 토스 위젯 생성
  useEffect(() => {
    if (!paymentDetails) return;

    loadTossPayments(paymentDetails.clientKey)
      .then(tossPayments => {
        const widgetInstance = tossPayments.widgets({
          customerKey: paymentDetails.customerKey, // 백엔드에서 받은 동적 customerKey 사용
        });
        setWidgets(widgetInstance);
      });
  }, [paymentDetails]);

  // 4. 위젯 UI 렌더링 및 금액 설정
  useEffect(() => {
    if (widgets == null || selectedProduct == null) return;

    widgets.setAmount({ currency: 'KRW', value: selectedProduct.price });

    widgets.renderPaymentMethods({ selector: "#payment-methods", variantKey: "DEFAULT" });
    widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" });
  }, [widgets, selectedProduct]);

  // 5. 결제하기 버튼 클릭
  const handlePayment = () => {
    if (!widgets || !paymentDetails) return;

    widgets.requestPayment({
      orderId: paymentDetails.orderId,
      orderName: paymentDetails.orderName,
      customerName: paymentDetails.customerName, // 이 값도 백엔드에서 오는 것을 사용
      successUrl: `${window.location.origin}/credit/success`,
      failUrl: `${window.location.origin}/credit/fail`,
    });
  };

  if (!selectedProduct) {
    return <CheckoutContainer><p>상품 정보를 불러오는 중...</p></CheckoutContainer>;
  }

  return (
    <CheckoutContainer>
      <h1>결제하기</h1>
      <ProductInfo>
        <p>상품명: {selectedProduct.description}</p>
        <p>크레딧: {selectedProduct.credits.toLocaleString()} C</p>
        <p>결제 금액: {selectedProduct.price.toLocaleString()} 원</p>
      </ProductInfo>

      <div id="payment-methods" style={{ width: '100%', maxWidth: '600px' }} />
      <div id="agreement" style={{ width: '100%', maxWidth: '600px' }} />

      <PurchaseButton onClick={handlePayment} disabled={!widgets}>
        {selectedProduct.price.toLocaleString()}원 결제하기
      </PurchaseButton>
    </CheckoutContainer>
  );
};

export default CheckoutClient;
