'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { api } from '@/api';

/**
 * 기업 마이페이지 - 채용공고 관리 컴포넌트
 *
 * 기능:
 * 1. 현재 로그인한 기업의 채용공고 목록 조회
 * 2. 채용공고 상태별 표시 (진행중/마감)
 * 3. 공고 관리 (수정/마감) - TODO: 구현 필요
 */
export default function ManagePostings() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DataGrid 컬럼 정의
  const columns = [
    { field: 'title', headerName: '채용공고 제목', width: 300 },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      renderCell: function(params) {
        const statusValue = params.value || 'OPEN'; // null 체크
        const statusMap = {
          'OPEN': { label: '진행중', color: 'success' },
          'CLOSED': { label: '마감', color: 'default' },
          'DRAFT': { label: '임시저장', color: 'warning' }
        };
        const statusInfo = statusMap[statusValue] || { label: statusValue, color: 'default' };
        return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
      }
    },
    {
      field: 'applicantCount',
      headerName: '지원자 수',
      type: 'number',
      width: 100,
      valueFormatter: (params) => {
        return params?.value !== undefined && params?.value !== null ? params.value : 0;
      }
    },
    {
      field: 'startDateFormatted',
      headerName: '모집 시작일',
      width: 130,
    },
    {
      field: 'endDateFormatted',
      headerName: '모집 마감일',
      width: 130,
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 180,
      renderCell: function(params) {
        if (!params || !params.row) return null; // null 체크
        return (
          <Box>
            <Button
              size="small"
              sx={{ mr: 1 }}
              onClick={() => router.push(`/mypage/company/postings/edit/${params.row.id}`)}
            >
              수정
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => alert('마감 기능은 준비 중입니다.')}
              disabled={params.row.status === 'CLOSED'}
            >
              마감
            </Button>
          </Box>
        );
      },
    },
  ];

  // 채용공고 목록 불러오기 (마운트 시 단 한 번만!)
  useEffect(() => {
    console.log('[ManagePostings] API 호출 시작');

    api.get('/api/companies/my/job-postings')
      .then(response => {
        console.log('[ManagePostings] 채용공고 로드 성공. 공고 수:', response.data.length);

        // DTO 배열을 DataGrid 형식으로 변환
        const formattedRows = response.data.map(posting => {
          // 상태 자동 판단 (endDate 기준)
          let statusValue = posting.status || 'OPEN';
          if (!posting.status && posting.endDate) {
            const today = new Date();
            const endDate = new Date(posting.endDate);
            statusValue = endDate < today ? 'CLOSED' : 'OPEN';
          }

          // 날짜 포맷팅 함수
          const formatDate = (dateStr) => {
            if (!dateStr) return null;
            try {
              const date = new Date(dateStr);
              if (isNaN(date.getTime())) return null;
              return date.toLocaleDateString('ko-KR');
            } catch (e) {
              return null;
            }
          };

          // 포맷된 날짜 생성
          const startDateFormatted = formatDate(posting.startDate) || '-';
          const endDateFormatted = formatDate(posting.endDate) || '상시채용';

          return {
            // 원본 데이터 먼저 spread (기반으로 사용)
            ...posting,
            // 그 다음 DataGrid 전용 필드로 덮어쓰기
            id: posting.postingIdx, // DataGrid는 id 필드 필수
            title: posting.title || '(제목 없음)',
            status: statusValue,
            applicantCount: posting.applicantCount || 0,
            startDate: posting.startDate, // 원본 날짜 (수정 페이지에서 사용)
            endDate: posting.endDate,     // 원본 날짜 (수정 페이지에서 사용)
            startDateFormatted: startDateFormatted, // 화면에 표시할 포맷된 날짜
            endDateFormatted: endDateFormatted,     // 화면에 표시할 포맷된 날짜
          };
        });

        console.log('[ManagePostings] 변환 완료. 첫 번째 row:', {
          title: formattedRows[0]?.title,
          startDate: formattedRows[0]?.startDate,
          endDate: formattedRows[0]?.endDate,
          startDateFormatted: formattedRows[0]?.startDateFormatted,
          endDateFormatted: formattedRows[0]?.endDateFormatted,
        });

        setRows(formattedRows);
        setLoading(false);
      })
      .catch(err => {
        console.error('[ManagePostings] 채용공고 로드 실패:', err);
        const errorMsg = err.response?.data?.message || '채용공고를 불러오는데 실패했습니다.';
        setError(errorMsg);
        setLoading(false);
      });
  }, []); // 빈 배열! 한 번만 실행

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>채용공고를 불러오는 중...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          채용공고 관리
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/mypage/company/postings/new')}
        >
          새 공고 등록
        </Button>
      </Box>

      {rows.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          등록된 채용공고가 없습니다. 첫 공고를 등록해보세요!
        </Alert>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      )}
    </Paper>
  );
}
