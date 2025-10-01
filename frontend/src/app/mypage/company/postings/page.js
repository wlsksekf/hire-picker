'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'title', headerName: '채용공고 제목', width: 350 },
  {
    field: 'status',
    headerName: '상태',
    width: 120,
    renderCell: (params) => (
        <Chip label={params.value} color={params.value === '진행중' ? 'success' : 'default'} size="small" />
    )
  },
  { field: 'applicants', headerName: '지원자 수', type: 'number', width: 120 },
  { field: 'createdDate', headerName: '등록일', width: 150 },
  {
    field: 'actions',
    headerName: '관리',
    width: 150,
    renderCell: (params) => (
      <Box>
        <Button size="small" sx={{ mr: 1 }}>수정</Button>
        <Button size="small" color="error">마감</Button>
      </Box>
    ),
  },
];

const rows = [
  { id: 1, title: '시니어 프론트엔드 개발자 (React)', status: '진행중', applicants: 5, createdDate: '2024-10-20' },
  { id: 2, title: '자바 백엔드 개발자 (신입/경력)', status: '진행중', applicants: 12, createdDate: '2024-10-15' },
  { id: 3, title: '[마감] iOS 개발자', status: '마감', applicants: 25, createdDate: '2024-09-30' },
];

const ManagePostings = () => {
  return (
    <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                채용공고 관리
            </Typography>
            <Button variant="contained" color="primary">
                새 공고 등록
            </Button>
        </Box>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Box>
    </Paper>
  );
};

export default ManagePostings;