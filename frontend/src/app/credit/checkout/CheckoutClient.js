// frontend/src/app/credit/checkout/CheckoutClient.js
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { initiateTossPayment } from '@/api';
import CreditCoinIcon from '@/components/CreditCoinIcon';
import theme from '@/theme/theme';
import { mixRgb, toRgbString, withAlpha } from '@/utils/color';

const PRIMARY = theme.colorSchemes.light.palette.primary.main;
const PRIMARY_DARK = theme.colorSchemes.light.palette.primary.dark;
const PRIMARY_RGB = toRgbString(PRIMARY);
const PRIMARY_DARK_RGB = toRgbString(PRIMARY_DARK);
const SECONDARY_TEXT = mixRgb(PRIMARY_RGB, '#000000', 0.18);
const BORDER_TINT = mixRgb(PRIMARY_RGB, '#ffffff', 0.25);
const DETAIL_BORDER = mixRgb(PRIMARY_RGB, '#ffffff', 0.18);
const DETAIL_BG = mixRgb(PRIMARY_RGB, '#ffffff', 0.1);
const CARD_SHADOW = withAlpha(PRIMARY_RGB, 0.16);
const BUTTON_SHADOW = withAlpha(PRIMARY_RGB, 0.22);

// 배경/정렬을 포함한 전체 페이지 래퍼
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 72px 16px;
  background: #ffffff;
`;

// 결제 카드: 상점 카드와 동일한 톤으로 구성
const CheckoutCard = styled.div`
  width: min(640px, 100%);
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid ${BORDER_TINT};
  box-shadow: 0 22px 44px ${CARD_SHADOW};
  padding: clamp(28px, 4vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// 카드 상단 타이틀/설명 영역
const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;

  h1 {
    margin: 0;
    font-size: clamp(1.9rem, 4vw, 2.4rem);
    font-weight: 800;
    color: ${PRIMARY};
  }

  p {
    margin: 0;
    color: ${SECONDARY_TEXT};
    font-size: 1rem;
  }
`;

// 선택된 상품을 요약해서 보여주는 카드
const SummaryCard = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  border-radius: 18px;
  border: 1px solid ${mixRgb(PRIMARY_RGB, '#ffffff', 0.22)};
  background: #ffffff;
`;

// 요약 텍스트 영역
const SummaryText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 1.16rem;
    color: ${PRIMARY_DARK_RGB};
  }

  span {
    font-size: 0.94rem;
    color: ${SECONDARY_TEXT};
  }
`;

// 상품 세부 정보(크레딧, 금액, 코드)를 격자로 배치
const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  background: ${DETAIL_BG};
  border: 1px solid ${DETAIL_BORDER};
`;

// 각 세부 항목 (라벨 + 값)
const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;

  label {
    font-size: 0.85rem;
    color: ${SECONDARY_TEXT};
  }

  strong {
    font-size: 1.05rem;
    color: ${PRIMARY_DARK_RGB};
  }
`;

// 결제 버튼 (상점 버튼 스타일과 동일하게 적용)
const PurchaseButton = styled.button`
  align-self: center;
  min-width: 220px;
  background: ${PRIMARY_RGB};
  color: #ffffff;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  box-shadow: 0 18px 32px ${BUTTON_SHADOW};

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 22px 36px ${withAlpha(PRIMARY_RGB, 0.28)};
    background: ${PRIMARY_DARK_RGB};
  }

  &:disabled {
    background: ${mixRgb(PRIMARY_RGB, '#ffffff', 0.3)};
    box-shadow: none;
    cursor: not-allowed;
  }
`;

// 상점과 동일한 상품 텍스트/구성 사용
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
