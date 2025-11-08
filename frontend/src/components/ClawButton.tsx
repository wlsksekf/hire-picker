"use client";
import React from 'react';
import styled, { css } from 'styled-components';

type ClawButtonProps = {
  variant?: 'red' | 'blue';
  ariaLabel?: string;
};

const ClawButton = ({ variant = 'red', ariaLabel }: ClawButtonProps) => {
  return (
    <StyledWrapper variant={variant}>
      <button className="btn" aria-label={ariaLabel}>
        <span className="back" />
        <span className="front" />
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ variant: 'red' | 'blue' }>`
  .btn {
    ${({ variant }) =>
      variant === 'red'
        ? css`
            --primary: 255, 90, 120;
            --secondary: 150, 50, 60;
          `
        : css`
            --primary: 75, 130, 255;
            --secondary: 35, 80, 180;
          `};
    width: 46px;
    height: 46px;
    border: none;
    outline: none;
    cursor: pointer;
    user-select: none;
    touch-action: manipulation;
    outline: 6px solid rgba(var(--primary), 0.35);
    border-radius: 50%;
    position: relative;
    transition: 0.25s ease;
    background: transparent;
  }

  .back {
    background: rgb(var(--secondary));
    border-radius: 50%;
    position: absolute;
    inset: 0;
  }

  .front {
    background: linear-gradient(0deg, rgba(var(--primary), 0.55) 15%, rgba(var(--primary), 0.9) 55%);
    box-shadow: 0 0.35em 0.9em -0.25em rgba(var(--secondary), 0.45);
    border-radius: 50%;
    border: 1px solid rgba(var(--secondary), 0.85);
    position: absolute;
    inset: 0;
    transform: translateY(-10%);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .btn:active .front {
    transform: translateY(-2%);
    box-shadow: 0 0;
  }
`;

export default ClawButton;
