import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const StyledButton = styled(Button)(function({ theme }) {
  return {
    padding: '15px 25px',
    border: 'unset',
    borderRadius: '15px',
    zIndex: 1,
    position: 'relative',
    fontWeight: 1000,
    fontSize: '17px',
    boxShadow: '4px 8px 19px -3px rgba(0,0,0,0.27)',
    transition: 'all 250ms',
    overflow: 'hidden',

    // 테마 모드에 따른 색상 설정
    color: theme.palette.mode === 'dark' ? '#e8e8e8' : '#212121',
    background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#e8e8e8',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: 0,
      borderRadius: '15px',
      // 호버 시 배경색도 테마에 따라 변경
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[200] : '#212121',
      zIndex: -1,
      boxShadow: '4px 8px 19px -3px rgba(0,0,0,0.27)',
      transition: 'all 250ms',
    },

    '&:hover': {
      // 호버 시 글자색도 테마에 따라 변경
      color: theme.palette.mode === 'dark' ? '#212121' : '#e8e8e8',
    },

    '&:hover::before': {
      width: '100%',
    },
  }
});

function AnimatedButton(props) {
  return <StyledButton {...props} />;
}

export default AnimatedButton;
