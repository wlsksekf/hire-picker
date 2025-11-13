'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { api } from '@/api';

// 지원 상태 코드와 라벨 매핑
const STATUS_OPTIONS = [
  { code: '0', label: '지원중', color: 'default' },
  { code: '1', label: '서류합격', color: 'info' },
  { code: '2', label: '면접합격', color: 'primary' },
  { code: '3', label: '최종합격', color: 'success' },
  { code: '4', label: '서류탈락', color: 'error' },
];

function ApplicantList() {
  const [postings, setPostings] = useState([]); // 기업이 등록한 공고 목록
  const [selectedPosting, setSelectedPosting] = useState(''); // 현재 선택된 공고 PK
  const [applicants, setApplicants] = useState([]); // 선택된 공고의 지원자 목록
  const [loadingPostings, setLoadingPostings] = useState(true); // 공고 목록 로딩 여부
  const [loadingApplicants, setLoadingApplicants] = useState(false); // 지원자 목록 로딩 여부
  const [resumeDialog, setResumeDialog] = useState({ open: false, loading: false, data: null }); // 이력서 모달 상태
  const [statusLoadingMap, setStatusLoadingMap] = useState({}); // 행별 상태 변경 로딩 여부
  const [errorMessage, setErrorMessage] = useState(null); // 전역 오류 메시지
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // 사용자 피드백

  // 상태 코드에서 라벨을 찾는 헬퍼
  const findStatusLabel = useCallback(
    (code) => STATUS_OPTIONS.find((option) => option.code === code)?.label ?? code,
    []
  );

  // 내 회사 공고 목록을 불러온다.
  const fetchPostings = useCallback(async () => {
    try {
      setLoadingPostings(true);
      setErrorMessage(null);
      const response = await api.get('/api/companies/my/job-postings');
      const postingOptions =
        response.data?.map((item) => ({
          id: item.postingIdx,
          title: item.title ?? '제목 미등록',
        })) ?? [];

      setPostings(postingOptions);
      if (postingOptions.length > 0) {
        setSelectedPosting((prev) => prev || postingOptions[0].id);
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message ?? '채용공고 목록을 불러오지 못했습니다.');
    } finally {
      setLoadingPostings(false);
    }
  }, []);

  // 특정 공고의 지원자 목록을 불러온다.
  const fetchApplicants = useCallback(
    async (postingIdx) => {
      if (!postingIdx) {
        setApplicants([]);
        return;
      }

      try {
        setLoadingApplicants(true);
        setErrorMessage(null);
        const response = await api.get(`/api/company/postings/${postingIdx}/applications`);
        const rows =
          response.data?.map((item) => ({
            id: `${item.postingIdx}-${item.resumeIdx}`,
            ...item,
            appliedAtLabel: item.appliedAt ? dayjs(item.appliedAt).format('YYYY-MM-DD') : '-',
            statusLabel: findStatusLabel(item.statusCode),
          })) ?? [];
        setApplicants(rows);
      } catch (error) {
        setErrorMessage(error?.response?.data?.message ?? '지원자 목록을 불러오지 못했습니다.');
        setApplicants([]);
      } finally {
        setLoadingApplicants(false);
      }
    },
    [findStatusLabel]
  );

  // 초기 공고 목록 로딩
  useEffect(() => {
    fetchPostings();
  }, [fetchPostings]);

  // 공고 선택이 변경되면 지원자 목록을 새로 불러온다.
  useEffect(() => {
    if (selectedPosting) {
      fetchApplicants(selectedPosting);
    } else {
      setApplicants([]);
    }
  }, [selectedPosting, fetchApplicants]);

  // 공고 선택 변경 처리
  const handlePostingChange = (event) => {
    setSelectedPosting(event.target.value);
  };

  // 이력서 보기 버튼 클릭 처리
  const handleOpenResume = useCallback(
    async (row) => {
      setResumeDialog({ open: true, loading: true, data: null });
      try {
        const response = await api.get(
          `/api/company/postings/${row.postingIdx}/applications/${row.resumeIdx}/resume`
        );
        setResumeDialog({ open: true, loading: false, data: response.data });
      } catch (error) {
        setResumeDialog({ open: false, loading: false, data: null });
        setSnackbar({
          open: true,
          message: error?.response?.data?.message ?? '이력서를 불러오지 못했습니다.',
          severity: 'error',
        });
      }
    },
    []
  );

  // 이력서 모달 닫기
  const handleCloseResume = () => {
    setResumeDialog({ open: false, loading: false, data: null });
  };

  // 지원 상태 변경 처리
  const handleStatusChange = useCallback(
    async (row, nextStatusCode) => {
      setStatusLoadingMap((prev) => ({ ...prev, [row.id]: true }));
      try {
        await api.patch(
          `/api/company/postings/${row.postingIdx}/applications/${row.resumeIdx}/status`,
          { statusCode: nextStatusCode }
        );

        setApplicants((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  statusCode: nextStatusCode,
                  statusLabel: findStatusLabel(nextStatusCode),
                }
              : item
          )
        );

        setSnackbar({
          open: true,
          message: '지원자 상태를 변경했습니다.',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: error?.response?.data?.message ?? '상태 변경에 실패했습니다.',
          severity: 'error',
        });
      } finally {
        setStatusLoadingMap((prev) => ({ ...prev, [row.id]: false }));
      }
    },
    [findStatusLabel]
  );

  // 스낵바 닫기
  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // DataGrid 컬럼 정의
  const columns = useMemo(
    () => [
      {
        field: 'applicantName',
        headerName: '지원자',
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'resumeTitle',
        headerName: '이력서',
        flex: 1.5,
        minWidth: 220,
      },
      {
        field: 'appliedAtLabel',
        headerName: '지원일',
        flex: 0.8,
        minWidth: 120,
      },
      {
        field: 'statusLabel',
        headerName: '현재 상태',
        flex: 0.8,
        minWidth: 140,
        renderCell: (params) => {
          const statusMeta =
            STATUS_OPTIONS.find((option) => option.code === params.row.statusCode) ?? STATUS_OPTIONS[0];
          return <Chip label={statusMeta.label} color={statusMeta.color} size="small" />;
        },
      },
      {
        field: 'statusControl',
        headerName: '상태 변경',
        flex: 1,
        minWidth: 180,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={params.row.statusCode ?? '0'}
              onChange={(event) => handleStatusChange(params.row, event.target.value)}
              disabled={Boolean(statusLoadingMap[params.row.id])}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },
      {
        field: 'actions',
        headerName: '이력서',
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Button variant="outlined" size="small" onClick={() => handleOpenResume(params.row)}>
            보기
          </Button>
        ),
      },
    ],
    [handleOpenResume, handleStatusChange, statusLoadingMap]
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} gap={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            지원자 목록
          </Typography>
          <FormControl sx={{ minWidth: 260 }} size="small">
            <InputLabel>채용공고 선택</InputLabel>
            <Select
              value={selectedPosting}
              label="채용공고 선택"
              onChange={handlePostingChange}
              disabled={loadingPostings || postings.length === 0}
            >
              {postings.map((posting) => (
                <MenuItem key={posting.id} value={posting.id}>
                  {posting.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {loadingPostings ? (
          <Stack alignItems="center" py={6} spacing={2}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              채용공고 목록을 불러오는 중입니다...
            </Typography>
          </Stack>
        ) : errorMessage ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        ) : postings.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            등록된 채용공고가 없습니다. 공고를 먼저 작성해주세요.
          </Alert>
        ) : loadingApplicants ? (
          <Stack alignItems="center" py={6} spacing={2}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              지원자 목록을 불러오는 중입니다...
            </Typography>
          </Stack>
        ) : applicants.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            아직 해당 공고에 지원자가 없습니다.
          </Alert>
        ) : (
          <Box sx={{ width: '100%', height: 520 }}>
            <DataGrid
              rows={applicants}
              columns={columns}
              pageSizeOptions={[10, 20, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        )}
      </Stack>

      <Dialog open={resumeDialog.open} onClose={handleCloseResume} maxWidth="md" fullWidth>
        <DialogTitle>제출 이력서</DialogTitle>
        <DialogContent dividers sx={{ minHeight: 300 }}>
          {resumeDialog.loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                이력서를 불러오는 중입니다...
              </Typography>
            </Stack>
          ) : resumeDialog.data ? (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                {resumeDialog.data.resumeTitle ?? '이력서 제목 미입력'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {resumeDialog.data.applicantName ?? '이름 미입력'} ·{' '}
                {resumeDialog.data.applicantEmail ?? '이메일 미입력'} ·{' '}
                {resumeDialog.data.applicantPhone ?? '연락처 미입력'}
              </Typography>

              {resumeDialog.data.imageUrl && (
                <Box
                  component="img"
                  src={resumeDialog.data.imageUrl}
                  alt="지원자 사진"
                  sx={{ width: 140, height: 140, borderRadius: 2, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
              )}

              <Divider />
              <Section label="성장 배경" content={resumeDialog.data.selfGrowth} />
              <Section label="성격 및 강점" content={resumeDialog.data.selfStrengths} />
              <Section label="지원 동기" content={resumeDialog.data.selfMotivation} />
              <Section label="입사 후 포부" content={resumeDialog.data.selfAspirations} />
              <Section label="보유 자격" content={resumeDialog.data.cert} />

              {resumeDialog.data.workHistory && (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    대표 경력
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resumeDialog.data.workHistory.companyName ?? '회사명 미입력'} ·{' '}
                    {resumeDialog.data.workHistory.position ?? '직책 미입력'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resumeDialog.data.workHistory.hireDate ?? '입사일 미입력'} ~{' '}
                    {resumeDialog.data.workHistory.resignDate ?? '퇴사일 미입력'}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                    {resumeDialog.data.workHistory.jobDescription ?? '업무 내용 미입력'}
                  </Typography>
                </Stack>
              )}
            </Stack>
          ) : (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              이력서 정보를 불러오지 못했습니다.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResume}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

// 이력서 섹션 공용 컴포넌트
function Section({ label, content }) {
  if (!content) {
    return null;
  }

  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2" fontWeight={700}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography>
    </Stack>
  );
}

export default ApplicantList;
