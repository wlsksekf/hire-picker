// frontend/src/components/PaymentHistory.js
'use client';

import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CircularProgress
} from '@mui/material';
import { getPaymentHistory } from '@/api';

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPaymentHistory()
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("결제 내역 불러오기 실패:", err);
        setError("결제 내역을 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: '1.2rem' }}>
        결제 내역
      </Typography>
      {history.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
          결제 내역이 없습니다.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 800 }} aria-label="payment history table">{/* minWidth를 800으로 늘림 */}
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>결제 ID</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>주문 ID</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>결제 금액</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>충전 크레딧</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>결제 수단</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>상태</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>승인 일시</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{history.map((row) =>
                <TableRow key={row.paymentIdx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.paymentIdx}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.orderId}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.amount.toLocaleString()} 원</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.chargedCredits.toLocaleString()} C</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.paymentMethod}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.status}</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{row.approvedAt ? new Date(row.approvedAt).toLocaleString() : '-'}</TableCell>
                </TableRow>
              )}</TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PaymentHistory;
