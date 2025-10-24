'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmTossPayment } from '@/api';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('결제를 승인하고 있습니다...');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    confirmTossPayment({ paymentKey, orderId, amount })
      .then(() => {
        setStatus('success');
        setMessage('결제가 성공적으로 완료되었습니다! 크레딧이 충전되었습니다.');
      })
      .catch(error => {
        setStatus('error');
        setMessage(error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.');
      });

  }, [searchParams]);

  return (
    <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        결제 결과
      </Typography>
      
      {status === 'loading' && <CircularProgress />}
      
      <Typography 
        variant="h6"
        color={status === 'success' ? 'primary.main' : 'error.main'}
      >
        {message}
      </Typography>

      {status === 'success' && (
        <Button variant="contained" onClick={() => router.push('/store')}>
          상점으로 돌아가기
        </Button>
      )}
      {status === 'error' && (
        <Button variant="outlined" onClick={() => router.push('/store')}>
          상점으로 돌아가기
        </Button>
      )}
    </Paper>
  );
}

// Suspense로 감싸서 searchParams를 안전하게 사용
export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<CircularProgress />}>
            <PaymentSuccessContent />
        </Suspense>
    );
}