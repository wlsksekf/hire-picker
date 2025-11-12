// frontend/src/app/credit/page.js
"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getCreditProducts } from "@/api";
import CreditProductCard from "@/components/CreditProductCard";
import ClawToggle from "@/components/ClawToggle";
import ClawButton from "@/components/ClawButton";
import { useRouter } from "next/navigation";
import CreditCoinIcon from "@/components/CreditCoinIcon";
import theme from "@/theme/theme";
import { mixRgb, toRgbString, withAlpha } from "@/utils/color";

const PRIMARY = theme.colorSchemes.light.palette.primary.main;
const PRIMARY_DARK = theme.colorSchemes.light.palette.primary.dark;
const PRIMARY_RGB = toRgbString(PRIMARY);
const PRIMARY_DARK_RGB = toRgbString(PRIMARY_DARK);
const SECONDARY_TEXT = mixRgb(PRIMARY_RGB, "#000000", 0.2);
const BORDER_TINT = mixRgb(PRIMARY_RGB, "#ffffff", 0.25);
const BOX_SHADOW = withAlpha(PRIMARY_RGB, 0.18);

// 전체 상점 영역 컨테이너 (배경 및 기본 패딩 설정)
const StoreContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 72px 24px 108px;
  display: flex;
  justify-content: center;
`;

// 본문 콘텐츠 최대 폭을 제한하고 가운데 정렬
const ContentWrapper = styled.div`
  width: min(1080px, 100%);
  display: flex;
  flex-direction: column;
  gap: 36px;
`;

// 상단 타이틀/설명/보유 크레딧 배치 영역
const HeaderSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.6rem);
    font-weight: 800;
    color: ${PRIMARY};
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: ${SECONDARY_TEXT};
  }
`;

// 현재 보유한 크레딧을 카드 형태로 보여주는 컴포넌트
const BalanceBadge = styled.div`
  align-self: flex-start;
  padding: 12px 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid ${BORDER_TINT};
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 14px 24px ${BOX_SHADOW};

  span {
    font-size: 0.88rem;
    color: ${SECONDARY_TEXT};
  }

  strong {
    font-size: 1.08rem;
    color: ${PRIMARY_DARK_RGB};
  }
`;

// 상품 카드를 3열 그리드로 배치(반응형 지원)
const CardSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 10px;
  justify-items: center;
`;

// 조이스틱/버튼 영역(카드가 가리지 않도록 위치 제어)
const ControlSection = styled.section`
  position: relative;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 2;
`;

// 조이스틱과 버튼을 나란히 배치
const ButtonRow = styled.div`
  display: flex;
  gap: 50px;
`;

const CreditPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);

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
          <p>필요한 크레딧을 빠르게 충전하고 다양한 서비스를 이용해 보세요.</p>
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
              accent={PRIMARY}
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
