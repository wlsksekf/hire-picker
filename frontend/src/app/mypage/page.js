
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

const MyPageDefault = () => {
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h5">마이페이지</Typography>
      <Typography variant="body1" color="text.secondary">
        좌측 메뉴를 선택하여 원하시는 정보를 확인하세요.
      </Typography>
    </Box>
  );
};

export default MyPageDefault;
