'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Link as MuiLink, Stack, Chip } from '@mui/material';
import NextLink from 'next/link';
import { DataGrid } from '@mui/x-data-grid';

// 상태 매핑: PUBLIC/PRIVATE -> 공개/비공개
const mapStatusToLabel = (status) => {
  if (!status) return '-';
  return status === 'PUBLIC' ? '공개' : '비공개';
};

export default function ResumesPage() {
  const [rows, setRows] = useState([]); // 이력서 목록
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지

  // DataGrid 컬럼 정의
  const columns = useMemo(() => ([
    {
      field: 'title',
      headerName: '이력서 제목',
      flex: 1,
      minWidth: 280,
      renderCell: (params) => (
        <MuiLink component={NextLink} href={`/mypage/personal/resumes/${params.row.id}`} underline="hover">
          {params.value}
        </MuiLink>
      ),
    },
    { field: 'status', headerName: '공개 상태', width: 140 },
    { field: 'lastModified', headerName: '최종 수정일', width: 160 },
    {
      field: 'actions',
      headerName: '관리',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: () => (
        <Box>
          <Button size="small" sx={{ mr: 1 }}>편집</Button>
          <Button size="small" color="error">삭제</Button>
        </Box>
      ),
    },
  ]), []);

  // 목록 불러오기
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/resumes', {
          method: 'GET',
          credentials: 'include', // 쿠키 인증 포함
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`목록 조회 실패: ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        const mapped = (Array.isArray(data) ? data : []).map((d) => ({
          id: d.id,
          title: d.title || '(제목 없음)',
          status: d.status || null,
          lastModified: d.modifiedDate ? new Date(d.modifiedDate).toISOString().slice(0, 10) : '-',
        }));
        setRows(mapped);
      } catch (e) {
        if (!ignore) setError(e.message || '목록을 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            이력서 관리
          </Typography>
          <Button variant="contained" color="primary">
            새 이력서 작성
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        <Box sx={{ height: 480, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            localeText={{
              noRowsLabel: '표시할 이력서가 없습니다.',
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
}

