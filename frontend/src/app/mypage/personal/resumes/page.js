'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// --- 이력서 목록 관련 코드 시작 ---
// DataGrid 컬럼 정의
const columns = [
  { field: 'title', headerName: '이력서 제목', width: 400 },
  { field: 'status', headerName: '상태', width: 150 },
  { field: 'lastModified', headerName: '최종 수정일', width: 200 },
  {
    field: 'actions',
    headerName: '관리',
    width: 150,
    renderCell: function(params) {
      return (
        <Box>
          <Button size="small" sx={{ mr: 1 }}>수정</Button>
          <Button size="small" color="error">삭제</Button>
        </Box>
      );
    },
  },
];

// DataGrid 행 데이터 (예시)
const rows = [
  { id: 1, title: '프론트엔드 개발자 이력서 (React)', status: '작성 완료', lastModified: '2024-10-26' },
  { id: 2, title: '신입 백엔드 개발자 포트폴리오', status: '작성 중', lastModified: '2024-10-25' },
  { id: 3, title: '[경력] 데브옵스 엔지니어', status: '작성 완료', lastModified: '2024-10-24' },
];
// --- 이력서 목록 관련 코드 끝 ---


export default function ResumesPage() {

  return (
    <Container maxWidth="lg"> 
      {/* --- 기존 이력서 목록 UI --- */}
       <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                이력서 관리
            </Typography>
            <Button variant="contained" color="primary">
                새 이력서 작성
            </Button>
        </Box>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Paper>
    </Container>
  );
}