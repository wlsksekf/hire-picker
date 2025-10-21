'use client';

import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// DataGrid 컬럼 정의
const columns = [
  { field: 'company', headerName: '회사명', width: 150 },
  { field: 'posting', headerName: '채용공고', width: 300 },
  { field: 'applyDate', headerName: '지원일', width: 150 },
  {
    field: 'status',
    headerName: '상태',
    width: 150,
    renderCell: function(params) {
        let color = 'default';
        if (params.value === '서류 통과') color = 'success';
        if (params.value === '불합격') color = 'error';
        return <Chip label={params.value} color={color} size="small" />;
    }
  },
];

// DataGrid 행 데이터 (예시)
const rows = [
  { id: 1, company: '(주)카카오', posting: 'AI 추천 서비스 백엔드 개발자', applyDate: '2024-10-20', status: '서류 통과' },
  { id: 2, company: '네이버웹툰', posting: '시니어 프론트엔드 개발자', applyDate: '2024-10-18', status: '지원 완료' },
  { id: 3, company: '(주)우아한형제들', posting: '배민선물하기 서버 개발자', applyDate: '2024-10-15', status: '불합격' },
  { id: 4, company: '토스뱅크', posting: '서버 개발자 (신입)', applyDate: '2024-10-12', status: '지원 완료' },
];

// 개인 마이페이지 - 지원 현황 컴포넌트
function ApplicationStatus() {
  return (
    <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            지원 현황
        </Typography>
      <Box sx={{ height: 400, width: '100%', mt: 3 }}>
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
}

export default ApplicationStatus;
