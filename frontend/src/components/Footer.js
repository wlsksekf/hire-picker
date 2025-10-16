
'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          HirePicker {new Date().getFullYear()}
          {'.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          (주)하이어피커 | 서울특별시 강남구 | 대표: 홍길동
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
