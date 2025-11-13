'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '@/api';

// 지원 상태 → 표시용 텍스트/색상 매핑
const STATUS_LABEL_MAP = {
  APPLIED: '지원 완료',
  PASSED: '서류 통과',
  INTERVIEW: '면접 진행',
  REJECTED: '불합격',
};

const STATUS_COLOR_MAP = {
  APPLIED: 'default',
  PASSED: 'success',
  INTERVIEW: 'info',
  REJECTED: 'error',
};

// 개인 마이페이지 - 지원 현황 컴포넌트
function ApplicationStatus() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/api/personal/applications');
        const data = response.data || [];
        const mappedRows = data.map((item) => ({
          id: `${item.resumeIdx}-${item.postingIdx}`,
          company: item.companyName || '회사 정보 없음',
          posting: item.postingTitle || '공고 정보 없음',
          applyDate: item.appliedAt
            ? new Date(item.appliedAt).toLocaleDateString()
            : '지원일 정보 없음',
          status: item.status || 'APPLIED',
        }));
        setRows(mappedRows);
      } catch (err) {
        console.error('Failed to load applications:', err);
        setError('지원 현황 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const columns = useMemo(() => [
    { field: 'company', headerName: '회사명', flex: 1, minWidth: 160 },
    { field: 'posting', headerName: '채용공고', flex: 2, minWidth: 240 },
    { field: 'applyDate', headerName: '지원일', width: 140 },
    {
      field: 'status',
      headerName: '상태',
      width: 150,
      renderCell: (params) => {
        const rawStatus = params.value || 'APPLIED';
        const label = STATUS_LABEL_MAP[rawStatus] || rawStatus;
        const color = STATUS_COLOR_MAP[rawStatus] || 'default';
        return <Chip label={label} color={color} size="small" />;
      },
    },
  ], []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
        지원 현황
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ height: 400, width: '100%', mt: 3 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            disableRowSelectionOnClick
            disableColumnMenu
          />
        </Box>
      )}
    </Paper>
  );
}

export default ApplicationStatus;
