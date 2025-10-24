'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { initiateTossPayment } from '@/api';
import useAuthStore from '@/store/authStore';

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "cqyfeCyz2UgoIFROWVIep";

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

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [widgets, setWidgets] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // URL 파라미터에서 상품 ID 가져오기
  useEffect(() => {
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
  }, [searchParams, router]);

  // 위젯 인스턴스 생성 및 렌더링
  useEffect(() => {
    if (selectedProduct == null) return;

    loadTossPayments(clientKey)
      .then(tossPayments => {
        const widgetInstance = tossPayments.widgets({ customerKey });
        setWidgets(widgetInstance);

        // 금액 설정 및 UI 렌더링
        widgetInstance.setAmount({ currency: 'KRW', value: selectedProduct.price });
        widgetInstance.renderPaymentMethods({
          selector: "#payment-methods",
          variantKey: "DEFAULT",
        });
        widgetInstance.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        });
      });
  }, [selectedProduct]);

  const handlePayment = () => {
    if (!widgets || !selectedProduct) return;

    initiateTossPayment(selectedProduct.id)
      .then(paymentDetails => {
        console.log('Payment Details from Backend:', paymentDetails); // 디버깅용 로그
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

      {/* 위젯 UI가 렌더링될 영역 */}
      <div id="payment-methods" style={{ width: '100%', maxWidth: '600px' }} />
      <div id="agreement" style={{ width: '100%', maxWidth: '600px' }} />

      <PurchaseButton onClick={handlePayment} disabled={!widgets}>
        {selectedProduct.price.toLocaleString()}원 결제하기
      </PurchaseButton>
    </CheckoutContainer>
  );
};

export default CheckoutPage;
