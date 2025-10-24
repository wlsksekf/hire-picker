'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { initiateTossPayment } from '@/api';
import useAuthStore from '@/store/authStore';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
const customerKey = process.env.NEXT_PUBLIC_TOSS_CUSTOMER_KEY;

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

const CheckoutClient = () => {
  const [mounted, setMounted] = useState(false); // [추가] 마운트 상태
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [widgets, setWidgets] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // [추가] 컴포넌트 마운트 시 mounted 상태를 true로 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // URL 파라미터에서 상품 ID 가져오기 (mounted 상태일 때만 실행)
  useEffect(() => {
    if (!mounted) return; // 마운트되지 않았다면 실행하지 않음

    const productId = searchParams.get('productId');
    if (productId) {
      const product = creditOptions.find(o => o.id === productId);
      if (product) {
        setSelectedProduct(product);
      } else {
        alert('유효하지 않은 상품입니다.');
        router.push('/store');
      }
    } else {
      alert('상품 정보가 없습니다.');
      router.push('/store');
    }
  }, [mounted, searchParams, router]); // mounted를 의존성 배열에 추가

  // 1. 위젯 인스턴스 생성
  useEffect(() => {
    if (selectedProduct == null) return; // 상품 정보가 없으면 위젯 생성 안 함

    loadTossPayments(clientKey)
      .then(tossPayments => {
        const widgetInstance = tossPayments.widgets({ customerKey });
        setWidgets(widgetInstance);
      });
  }, [selectedProduct]); // selectedProduct가 있을 때 위젯 생성

  // 2. 위젯 UI 렌더링 및 금액 설정
  useEffect(() => {
    if (widgets == null || selectedProduct == null) return;

    // 금액 설정
    widgets.setAmount({ currency: 'KRW', value: selectedProduct.price });

    // UI 렌더링
    widgets.renderPaymentMethods({
      selector: "#payment-methods",
      variantKey: "DEFAULT",
    });
    widgets.renderAgreement({
      selector: "#agreement",
      variantKey: "AGREEMENT",
    });
  }, [widgets, selectedProduct]); // widgets와 selectedProduct가 변경될 때마다 실행

  const handlePayment = () => {
    if (!widgets || !selectedProduct) return;

    initiateTossPayment(selectedProduct.id)
      .then(paymentDetails => {
        widgets.requestPayment({
          orderId: paymentDetails.orderId,
          orderName: paymentDetails.orderName,
          customerName: paymentDetails.customerName,
          successUrl: `${window.location.origin}/mypage/payment-success`,
          failUrl: `${window.location.origin}/mypage/payment-fail`,
        });
      })
      .catch(error => {
        console.error('결제 시작 중 오류 발생:', error);
        alert('결제 시작 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      });
  };

  if (!mounted || !selectedProduct) {
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

      {/* 위젯 UI가 렌더링될 영역 */}
      <div id="payment-methods" style={{ width: '100%', maxWidth: '600px' }} />
      <div id="agreement" style={{ width: '100%', maxWidth: '600px' }} />

      <PurchaseButton onClick={handlePayment} disabled={!widgets}>
        {selectedProduct.price.toLocaleString()}원 결제하기
      </PurchaseButton>
    </CheckoutContainer>
  );
};

export default CheckoutClient;