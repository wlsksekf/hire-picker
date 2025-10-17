'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'name', headerName: '이름', width: 150 },
  { field: 'resumeTitle', headerName: '이력서', width: 300 },
  { field: 'applyDate', headerName: '지원일', width: 150 },
  {
    field: 'status',
    headerName: '상태',
    width: 150,
    renderCell: function(params) {
        let color = 'default';
        if (params.value === '합격') color = 'success';
        if (params.value === '불합격') color = 'error';
        return <Chip label={params.value} color={color} size="small" />;
    }
  },
];

const rows = [
  { id: 1, name: '김개발', resumeTitle: '프론트엔드 개발자 이력서', applyDate: '2024-10-25', status: '검토중' },
  { id: 2, name: '박서버', resumeTitle: '[경력] 백엔드 엔지니어', applyDate: '2024-10-24', status: '합격' },
  { id: 3, name: '최신입', resumeTitle: '신입 개발자 포트폴리오', applyDate: '2024-10-23', status: '불합격' },
  { id: 4, name: '이디비', resumeTitle: '데이터베이스 관리자 지원합니다', applyDate: '2024-10-22', status: '검토중' },
];

function ApplicantList() {
  const [posting, setPosting] = React.useState('');

  function handleChange(event) {
    setPosting(event.target.value);
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 3 }}>
          지원자 목록
        </Typography>
        <FormControl sx={{ minWidth: 300 }} size="small">
          <InputLabel>채용공고 선택</InputLabel>
          <Select value={posting} label="채용공고 선택" onChange={handleChange}>
            <MenuItem value={10}>시니어 프론트엔드 개발자 (React)</MenuItem>
            <MenuItem value={20}>자바 백엔드 개발자 (신입/경력)</MenuItem>
          </Select>
        </FormControl>
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
}

export default ApplicantList;