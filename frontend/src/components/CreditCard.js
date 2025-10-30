// frontend/src/components/CreditCard.js
"use client";
import React from 'react';
import styled, { css } from 'styled-components';

const CreditCard = ({ id, credits, price, description, isSelected, onClick }) => {
  return (
    <StyledWrapper onClick={onClick} isSelected={isSelected}>
      <div className="card">
        <div className="content">
          <div className="back">
            <div className="back-content">
              <strong>{description}</strong>
            </div>
          </div>
          <div className="front">
            <div className="img">
              <div className="circle"></div>
              <div className="circle" id="right"></div>
              <div className="circle" id="bottom"></div>
            </div>
            <div className="front-content">
              <small className="badge">Credit</small>
              <div className="description">
                <div className="title">
                  <p className="title">
                    <strong>{credits.toLocaleString()} C</strong>
                  </p>
                </div>
                <p className="card-footer">
                  ₩ {price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSelected'].includes(prop),
})`
  cursor: pointer;

  .card {
    overflow: visible;
    width: 190px;
    height: 254px;
    border: 3px solid transparent; // 테두리 굵기를 3px로 증가
    border-radius: 8px; 
    transition: all 0.3s ease-in-out; // 모든 효과에 애니메이션 적용

    ${({ isSelected }) =>
      isSelected &&
      css`
        border-color: ${({ theme }) => theme.palette.primary.main};
        box-shadow: 0 0 12px 3px ${({ theme }) => theme.palette.primary.light}; // 빛나는 효과 추가
      `}
  }

  .content {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 300ms;
    box-shadow: 0px 0px 10px 1px #000000ee;
    border-radius: 5px;
  }

  .front, .back {
    background-color: white;
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 5px;
    overflow: hidden;
  }

  .back {
    width: 100%;
    height: 100%;
    justify-content: center;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .back::before {
    position: absolute;
    content: ' ';
    display: block;
    width: 160px;
    height: 160%;
    background: linear-gradient(90deg, transparent, ${({ theme }) => theme.palette.primary.main}, ${({ theme }) => theme.palette.primary.main}, ${({ theme }) => theme.palette.primary.main}, ${({ theme }) => theme.palette.primary.main}, transparent);
    animation: rotation_481 5000ms infinite linear;
  }

  .back-content {
    position: absolute;
    width: 99%;
    height: 99%;
    background-color: white;
    border-radius: 5px;
    color: black;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;
  }

  .card:hover .content {
    transform: rotateY(180deg);
  }

  @keyframes rotation_481 {
    0% {
      transform: rotateZ(0deg);
    }

    100% {
      transform: rotateZ(360deg);
    }
  }

  .front {
    transform: rotateY(180deg);
    color: black;
  }

  .front .front-content {
    position: absolute;
    width: 100%;
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .front-content .badge {
    background-color: #ffffff55;
    padding: 2px 10px;
    border-radius: 10px;
    backdrop-filter: blur(2px);
    width: fit-content;
  }

  .description {
    box-shadow: 0px 0px 10px 5px #cccccc88;
    width: 100%;
    padding: 10px;
    background-color: #ffffff99;
    backdrop-filter: blur(5px);
    border-radius: 5px;
  }

  .title {
    font-size: 1.2rem;
    font-weight: bold;
    max-width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .title p {
    width: 100%;
  }

  .card-footer {
    color: #000000dd;
    margin-top: 5px;
    font-size: 1rem;
  }

  .front .img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .circle {
    display: none; /* 흐릿한 점들 제거 */
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background-color: #ffbb66;
    position: relative;
    filter: blur(15px);
    animation: floating 2600ms infinite linear;
  }

  #bottom {
    background-color: #ff8866;
    left: 50px;
    top: 0px;
    width: 150px;
    height: 150px;
    animation-delay: -800ms;
  }

  #right {
    background-color: #ff2233;
    left: 160px;
    top: -80px;
    width: 30px;
    height: 30px;
    animation-delay: -1800ms;
  }

  @keyframes floating {
    0% {
      transform: translateY(0px);
    }

    50% {
      transform: translateY(10px);
    }

    100% {
      transform: translateY(0px);
    }
  }
`;

export default CreditCard;
