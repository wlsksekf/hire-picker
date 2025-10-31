'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';

// 웹사이트의 푸터 컴포넌트
function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3, // padding-top, padding-bottom
        px: 2, // padding-left, padding-right
        mt: 'auto', // margin-top: auto
        backgroundColor: 'background.default', // 배경색
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          HirePicker {new Date().getFullYear()}
          {'.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          (주)하이어피커 | 서울특별시 강남구 | 대표: 김진환
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;