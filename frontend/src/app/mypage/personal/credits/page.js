'use client';

import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'orderId', headerName: '주문번호', width: 200 },
  { field: 'product', headerName: '상품명', width: 250 },
  { field: 'amount', headerName: '결제 금액', width: 150, type: 'number' },
  { field: 'date', headerName: '결제일', width: 180 },
];

const rows = [
  { id: 1, orderId: 'ORD20241026-001', product: '이력서 열람 10회권', amount: 10000, date: '2024-10-26' },
  { id: 2, orderId: 'ORD20240915-003', product: '[PROMOTION] AI 추천 1개월권', amount: 5000, date: '2024-09-15' },
  { id: 3, orderId: 'ORD20240801-002', product: '이력서 열람 1회권', amount: 1500, date: '2024-08-01' },
];

const Credits = () => {
  return (
    <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                크레딧/결제 내역
            </Typography>
            <Button variant="contained" color="primary">
                크레딧 충전하기
            </Button>
        </Box>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>
    </Paper>
  );
};

export default Credits;