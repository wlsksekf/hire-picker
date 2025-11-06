'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Link from 'next/link';

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {'Copyright © '}
            HirePicker {new Date().getFullYear()}
            {'.'}
          </Typography>
          <Link href="/support" passHref style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { textDecoration: 'underline' }, cursor: 'pointer' }}>
              고객센터
            </Typography>
          </Link>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          (주)하이어피커 | 서울특별시 강남구 | 대표: 김진환
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;