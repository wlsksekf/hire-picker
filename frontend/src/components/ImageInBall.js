'use client';

import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';

// 이미지를 3D 유리구슬 효과로 감싸는 컴포넌트
function ImageInBall({ imgSrc, alt, sx }) {
  const theme = useTheme();

  return (
    <Box sx={{
      ...sx,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '1.5px solid rgba(255, 255, 255, 0.2)',
      boxShadow: `0 5px 15px ${alpha(theme.palette.common.black, 0.2)}`,
      // 3D 유리 효과를 위한 그라데이션
      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(255,255,255,0.1) 60%)',
      backdropFilter: 'blur(4px)',

      // 하단 초록색 반구
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '50%',
        zIndex: 2,
        // 3D 효과를 위한 그라데이션
        background: `radial-gradient(circle at 30% 20%, ${theme.palette.primary.light}, ${theme.palette.primary.main} 80%, ${theme.palette.primary.dark})`,
        // 곡선 구분선
        boxShadow: `inset 0 3px 4px ${alpha(theme.palette.common.black, 0.25)}`,
      },
      
      // 상단 광택 효과
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '5%',
        left: '10%',
        width: '80%',
        height: '80%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 15% 15%, rgba(255,255,255,0.6), transparent 50%)',
        zIndex: 3,
      },
    }}>
      <Box
        component="img"
        src={imgSrc}
        alt={alt}
        sx={{
          width: '60%',
          height: '60%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
          zIndex: 1,
        }}
      />
    </Box>
  );
}

export default ImageInBall;