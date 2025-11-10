"use client";

import React from "react";
import styled, { css } from "styled-components";

// 조이스틱 버튼: variant 에 따라 빨간/파란 버튼 색상 지정
interface ClawButtonProps {
  label?: string;
  variant?: "red" | "blue";
  onClick?: () => void;
}

const ClawButton: React.FC<ClawButtonProps> = ({ label, variant = "red", onClick }) => {
  return (
    <StyledWrapper data-variant={variant} onClick={onClick}>
      <div className="btn-class-name">
        <span className="back" />
        <span className="front">{label}</span>
      </div>
    </StyledWrapper>
  );
};

// 버튼 공통 스타일 + 색상 변형(variant) 처리
const StyledWrapper = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;

  .btn-class-name {
    --primary: 255, 90, 120;
    --secondary: 150, 50, 60;
    width: 46px;
    height: 44px;
    border: none;
    outline: none;
    user-select: none;
    touch-action: manipulation;
    outline: 6px solid rgba(var(--primary), 0.45);
    border-radius: 100%;
    position: relative;
    transition: 0.3s;
  }

  ${({ "data-variant": variant }) =>
    variant === "blue" &&
    css`
      .btn-class-name {
        --primary: 82, 132, 255;
        --secondary: 46, 66, 140;
      }
    `}

  .btn-class-name .back {
    background: rgb(var(--secondary));
    border-radius: 100%;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .btn-class-name .front {
    background: linear-gradient(0deg, rgba(var(--primary), 0.6) 20%, rgba(var(--primary)) 50%);
    box-shadow: 0 0.45em 0.9em -0.2em rgba(var(--secondary), 0.5);
    border-radius: 100%;
    position: absolute;
    border: 1px solid rgb(var(--secondary));
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: inherit;
    transform: translateY(-12%);
    transition: 0.15s;
    color: rgb(var(--secondary));
  }

  &:active .front {
    transform: translateY(0%);
    box-shadow: none;
  }
`;

export default ClawButton;
