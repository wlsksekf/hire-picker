"use client";

import React from "react";
import styled, { css } from "styled-components";
import CreditCoinIcon from "@/components/CreditCoinIcon";

// 크레딧 상품 카드 컴포넌트: 상점과 결제 페이지에서 재사용
const CreditProductCard = ({
  badge,
  title,
  description,
  credits,
  price,
  accent = "#1c63ff",
  imageVariant = "single",
  selected = false,
  onClick,
}) => {
  return (
    <StyledWrapper accent={accent} selected={selected} onClick={onClick}>
      <div className="card">
        {/* 추천/신규 등의 배지 표시 */}
        {badge && <div className="card__badge">{badge}</div>}
        <div className="card__shine" />
        <div className="card__glow" />
        <div className="card__content">
          <div className="card__image">
            <CreditCoinIcon variant={imageVariant} />
          </div>
          <div className="card__text">
            <p className="card__title">{title}</p>
            <p className="card__description">{description}</p>
          </div>
          <div className="card__footer">
            <div className="card__price">₩ {price.toLocaleString()}</div>
            <div className="card__credits">{credits.toLocaleString()} C</div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

// 카드 전체 스타일 정의 (선택 여부에 따라 테두리/그림자 변경)
const StyledWrapper = styled.button.withConfig({
  shouldForwardProp: (prop) => !["accent", "selected"].includes(prop),
}).attrs({ type: "button" })`
  --card-bg: #ffffff;
  --card-text: #1f2d45;
  --card-muted: #6f7a8f;
  --card-shadow: 0 14px 24px rgba(28, 42, 74, 0.06);
  --card-accent: ${({ accent }) => accent};

  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font: inherit;
  text-align: left;

  .card {
    width: 208px;
    height: 254px;
    background: var(--card-bg);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: var(--card-shadow);
    border: 1px solid rgba(28, 99, 255, 0.08);
  }

  ${({ selected }) =>
    selected &&
    css`
      .card {
        border-color: rgba(28, 99, 255, 0.35);
        box-shadow: 0 22px 36px rgba(28, 42, 74, 0.12);
      }
    `}

  .card__shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 255, 255, 0.7) 50%,
      rgba(255, 255, 255, 0) 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .card__glow {
    position: absolute;
    inset: -12px;
    background: radial-gradient(
      circle at 50% -10%,
      rgba(28, 99, 255, 0.18) 0%,
      rgba(28, 99, 255, 0) 70%
    );
    opacity: 0;
    transition: opacity 0.45s ease;
  }

  .card__content {
    padding: 1.35em 1.25em;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1em;
    position: relative;
    z-index: 1;
  }

  .card__badge {
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(28, 99, 255, 0.1);
    color: var(--card-accent);
    padding: 0.32em 0.7em;
    border-radius: 999px;
    font-size: 0.68em;
    font-weight: 600;
    letter-spacing: 0.06em;
    transform: scale(0.75);
    opacity: 0;
    transition: all 0.35s ease;
  }

  .card__image {
    width: 100%;
    height: 110px;
    background: linear-gradient(135deg, rgba(28, 99, 255, 0.08), rgba(28, 99, 255, 0.18));
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .card__image::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 40%),
      repeating-linear-gradient(45deg, rgba(28, 99, 255, 0.08) 0px, rgba(28, 99, 255, 0.08) 2px, transparent 2px, transparent 4px);
    opacity: 0.45;
  }

  .card__text {
    display: flex;
    flex-direction: column;
    gap: 0.35em;
  }

  .card__title {
    color: var(--card-text);
    font-size: 1.05em;
    margin: 0;
    font-weight: 700;
    transition: color 0.3s ease, transform 0.3s ease;
  }

  .card__description {
    color: var(--card-muted);
    font-size: 0.78em;
    margin: 0;
    line-height: 1.4;
    transition: color 0.3s ease, transform 0.3s ease;
  }

  .card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .card__price {
    color: var(--card-text);
    font-weight: 700;
    font-size: 0.95em;
    transition: color 0.3s ease, transform 0.3s ease;
  }

  .card__credits {
    font-size: 0.85em;
    color: var(--card-accent);
    font-weight: 600;
  }

  .card:hover .card__shine {
    opacity: 1;
    animation: shine 3s infinite;
  }

  .card:hover .card__glow {
    opacity: 1;
  }

  .card:hover .card__badge {
    transform: scale(1);
    opacity: 1;
  }

  .card:hover .card__title,
  .card:hover .card__price,
  .card:hover .card__description {
    transform: translateX(2px);
    color: var(--card-accent);
  }

  .card:active {
    transform: translateY(-4px) scale(0.99);
  }

  @keyframes shine {
    0% {
      background-position: -100% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

export default CreditProductCard;
