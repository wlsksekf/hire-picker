import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const StyledButton = styled(Button)(({ theme, ownerState }) => {
  // ownerState가 undefined일 경우를 대비하여 기본값 {} 할당
  const { color = 'primary' } = ownerState || {}; 
  const mainColor = theme.palette[color]?.main || theme.palette.primary.main;
  const contrastColor = theme.palette.common.white; // 호버 시 글자색은 흰색으로 고정

  return {
    background: 'transparent',
    position: 'relative',
    padding: '5px 15px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '17px',
    fontWeight: 600,
    cursor: 'pointer',
    border: `1px solid ${mainColor}`,
    borderRadius: '25px',
    outline: 'none',
    overflow: 'hidden',
    color: mainColor,
    transition: 'color 0.3s 0.1s ease-out',
    zIndex: 1,

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: mainColor,
      borderRadius: 'inherit', // 부모의 border-radius 상속
      transformOrigin: 'center',
      transform: 'scaleX(0)',
      transition: 'transform 0.4s ease-in-out',
      zIndex: -1,
    },

    '&:hover': {
      color: contrastColor,
    },

    '&:hover::before': {
      transform: 'scaleX(1)',
    },
  };
});

const AnimatedButton = (props) => {
  // StyledButton에 ownerState prop을 명시적으로 전달
  return <StyledButton ownerState={props} {...props} />;
};

export default AnimatedButton;