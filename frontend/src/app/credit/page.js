// frontend/src/app/credit/page.js
"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getCreditProducts, initiateTossPayment } from "@/api";
import CreditProductCard from "@/components/CreditProductCard";
import ClawToggle from "@/components/ClawToggle";
import ClawButton from "@/components/ClawButton";
import { useRouter } from "next/navigation";
import CreditCoinIcon from "@/components/CreditCoinIcon";

// 전체 상점 영역 컨테이너 (배경 및 기본 패딩 설정)
const StoreContainer = styled.div`
  min-height: 100vh;
  background: #f7f8fb;
  padding: 80px 24px 120px;
  display: flex;
  justify-content: center;
`;

// 본문 콘텐츠 최대 폭을 제한하고 가운데 정렬
const ContentWrapper = styled.div`
  width: min(1080px, 100%);
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

// 상단 타이틀/설명/보유 크레딧 배치 영역
const HeaderSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.6rem);
    font-weight: 800;
    color: #1c2a4a;
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: #6f7a94;
  }
`;

// 현재 보유한 크레딧을 카드 형태로 보여주는 컴포넌트
const BalanceBadge = styled.div`
  align-self: flex-start;
  padding: 16px 22px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid #dfe5f5;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 16px 32px rgba(28, 42, 74, 0.06);

  span {
    font-size: 0.9rem;
    color: #6f7a94;
  }

  strong {
    font-size: 1.1rem;
    color: #1c2a4a;
  }
`;

// 상품 카드를 3열 그리드로 배치(반응형 지원)
const CardSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 24px;
`;

// 조이스틱/버튼 영역(카드가 가리지 않도록 위치 제어)
const ControlSection = styled.section`
  position: relative;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  z-index: 2;
`; 

// 조이스틱과 버튼을 나란히 배치
const ButtonRow = styled.div`
  display: flex;
  gap: 28px;
`;

const CreditPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // 초기 로딩: 상품 목록과 보유 크레딧 불러오기
  useEffect(() => {
    getCreditProducts()
      .then((res) => {
        setProducts(res.products || []);
        setBalance(res.balance || 0);
      })
      .catch((err) => {
        console.error("크레딧 상품을 불러오는 중 오류", err);
      });
  }, []);

  // 결제 페이지 이동 로직: 선택한 상품 id를 쿼리로 전달
  const handlePurchase = (productId) => {
    if (!productId) return;
    setSelectedProductId(productId);
    router.push(`/credit/checkout?productId=${productId}`);
  };

  return (
    <StoreContainer>
      <ContentWrapper>
        <HeaderSection>
          <h1>크레딧 상점</h1>
          <p>뽑기 기계처럼 간편하게 크레딧을 충전해 보세요.</p>
          <BalanceBadge>
            <CreditCoinIcon />
            <div>
              <span>나의 보유 크레딧</span>
              <strong>{balance.toLocaleString()} C</strong>
            </div>
          </BalanceBadge>
        </HeaderSection>

        <CardSection>
          {products.map((product) => (
            <CreditProductCard
              key={product.id}
              badge={product.badge}
              title={product.title}
              description={product.description}
              credits={product.credits}
              price={product.price}
              accent={product.accent}
              imageVariant={product.imageVariant}
              selected={selectedProductId === product.id}
              onClick={() => handlePurchase(product.id)}
            />
          ))}
        </CardSection>

        <ControlSection>
          <ClawToggle />
          <ButtonRow>
            <ClawButton variant="red" label="GO" />
            <ClawButton variant="blue" label="SET" />
          </ButtonRow>
        </ControlSection>
      </ContentWrapper>
    </StoreContainer>
  );
};

export default CreditPage;
