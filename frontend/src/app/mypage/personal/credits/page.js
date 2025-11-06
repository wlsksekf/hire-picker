'use client';

import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import PaymentHistory from '../../../../components/PaymentHistory'; // PaymentHistory 컴포넌트 임포트

// 개인 마이페이지 - 크레딧/결제 내역 컴포넌트
function Credits() {
  const router = useRouter();

  const handleChargeCredit = () => {
    router.push('/credit'); // 크레딧 상점 페이지로 이동
  };

  return (
    <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                크레딧/결제 내역
            </Typography>
            <Button variant="contained" color="primary" onClick={handleChargeCredit}>
                크레딧 충전하기
            </Button>
        </Box>
        <PaymentHistory />
    </Paper>
  );
}

export default Credits;
