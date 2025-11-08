// frontend/src/app/credit/checkout/CheckoutClient.js
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { initiateTossPayment } from '@/api';
import CreditCoinIcon from '@/components/CreditCoinIcon';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 64px 16px;
  background: #f7f8fb;
`;

const CheckoutCard = styled.div`
  width: min(640px, 100%);
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #e5e8ef;
  box-shadow: 0 20px 40px rgba(28, 42, 74, 0.08);
  padding: clamp(28px, 4vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;

  h1 {
    margin: 0;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 800;
    color: #1c2a4a;
  }

  p {
    margin: 0;
    color: #6f7a94;
    font-size: 1rem;
  }
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 22px;
  border-radius: 18px;
  border: 1px solid rgba(28, 99, 255, 0.1);
  background: linear-gradient(135deg, rgba(28, 99, 255, 0.06), rgba(28, 99, 255, 0.12));
`;

const SummaryText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  strong {
    font-size: 1.15rem;
    color: #1c2a4a;
  }

  span {
    font-size: 0.92rem;
    color: #4d5978;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: #f2f5ff;
  border: 1px solid #dfe5f5;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;

  label {
    font-size: 0.85rem;
    color: #6f7a94;
  }

  strong {
    font-size: 1.05rem;
    color: #1c2a4a;
  }
`;

const PurchaseButton = styled.button`
  align-self: center;
  min-width: 220px;
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

const creditOptions = [
  {
    id: 'CREDIT_10K',
    title: '스타터 코인팩',
    credits: 10000,
    price: 10000,
    description: '입문자를 위한 기본 충전',
  },
  {
    id: 'CREDIT_50K',
    title: '프로 코인팩',
    credits: 50000,
    price: 45000,
    description: '10% 혜택으로 넉넉하게',
  },
  {
    id: 'CREDIT_100K',
    title: '언리미티드 코인팩',
    credits: 100000,
    price: 70000,
    description: '가장 많이 찾는 할인 구성',
  },
];

const CheckoutClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [widgets, setWidgets] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      const product = creditOptions.find((o) => o.id === productId);
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

  useEffect(() => {
    if (!selectedProduct) return;

    initiateTossPayment(selectedProduct.id)
      .then((details) => {
        setPaymentDetails(details);
      })
      .catch((error) => {
        console.error('결제 정보 생성 중 오류 발생:', error);
        alert('결제 정보를 가져오는 중 오류가 발생했습니다.');
      });
  }, [selectedProduct]);

  useEffect(() => {
    if (!paymentDetails) return;

    loadTossPayments(paymentDetails.clientKey).then((tossPayments) => {
      const widgetInstance = tossPayments.widgets({
        customerKey: paymentDetails.customerKey,
      });
      setWidgets(widgetInstance);
    });
  }, [paymentDetails]);

  useEffect(() => {
    if (widgets == null || selectedProduct == null) return;

    widgets.setAmount({ currency: 'KRW', value: selectedProduct.price });

    widgets.renderPaymentMethods({ selector: '#payment-methods', variantKey: 'DEFAULT' });
    widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' });
  }, [widgets, selectedProduct]);

  const handlePayment = () => {
    if (!widgets || !paymentDetails) return;

    widgets.requestPayment({
      orderId: paymentDetails.orderId,
      orderName: paymentDetails.orderName,
      customerName: paymentDetails.customerName,
      successUrl: `${window.location.origin}/credit/success`,
      failUrl: `${window.location.origin}/credit/fail`,
    });
  };

  if (!selectedProduct) {
    return (
      <PageWrapper>
        <CheckoutCard>
          <p>상품 정보를 불러오는 중...</p>
        </CheckoutCard>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <CheckoutCard>
        <HeaderSection>
          <h1>크레딧 결제</h1>
          <p>선택하신 크레딧 상품을 확인하시고 결제를 진행해 주세요.</p>
        </HeaderSection>

        <SummaryCard>
          <CreditCoinIcon />
          <SummaryText>
            <strong>{selectedProduct.title}</strong>
            <span>{selectedProduct.description}</span>
          </SummaryText>
        </SummaryCard>

        <DetailGrid>
          <DetailItem>
            <label>크레딧</label>
            <strong>{selectedProduct.credits.toLocaleString()} C</strong>
          </DetailItem>
          <DetailItem>
            <label>결제 금액</label>
            <strong>{selectedProduct.price.toLocaleString()} 원</strong>
          </DetailItem>
          <DetailItem>
            <label>상품 코드</label>
            <strong>{selectedProduct.id}</strong>
          </DetailItem>
        </DetailGrid>

        <div id="payment-methods" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }} />
        <div id="agreement" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }} />

        <PurchaseButton onClick={handlePayment} disabled={!widgets}>
          {selectedProduct.price.toLocaleString()}원 결제하기
        </PurchaseButton>
      </CheckoutCard>
    </PageWrapper>
  );
};

export default CheckoutClient;
