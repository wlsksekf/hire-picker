'use client';

import { useEffect, useState } from 'react';
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
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import dayjs from 'dayjs';
import { api } from '../../../../api';
import { MINT_PRIMARY_DARK } from '../adminTheme';

export default function CompanyApprovalTab() {
  const [approvals, setApprovals] = useState([]); // 승인 대기 기업 목록
  const [loading, setLoading] = useState(true); // 목록 로딩 상태
  const [error, setError] = useState(null); // API 에러 메시지
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 검토 모달 표시 여부
  const [selectedApproval, setSelectedApproval] = useState(null); // 현재 검토 중인 기업 데이터
  const [isApproving, setIsApproving] = useState(false); // 승인 API 호출 중 여부
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // 사용자 안내 스낵바

  useEffect(() => {
    // 승인 대기 기업 목록을 백엔드에서 불러온다
    const fetchApprovals = async () => {
      try {
        const response = await api.get('/api/manage/company-users/pending');
        setApprovals(response.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || '승인 대기 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const handleOpenDialog = (item) => {
    setSelectedApproval(item); // 선택된 승인 요청 데이터 보관
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedApproval(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleApprove = async () => {
    if (!selectedApproval) {
      return;
    }

    setIsApproving(true);
    try {
      await api.post(`/api/manage/company-users/${selectedApproval.companyUserId}/approve`); // 승인 API 호출
      // 승인 완료된 카드는 목록에서 제거
      setApprovals((prev) => prev.filter((item) => item.companyUserId !== selectedApproval.companyUserId));

      setSnackbar({
        open: true,
        message: `${selectedApproval.companyName || '회사'} 승인 완료`,
        severity: 'success',
      });
      handleCloseDialog();
    } catch (approveError) {
      setSnackbar({
        open: true,
        message: approveError?.response?.data?.message || '승인 처리에 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        boxShadow: '0 18px 32px -30px rgba(17,24,39,0.3)',
        background: '#ffffff',
        border: '1px solid rgba(17,24,39,0.06)',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700} color="#111827">
            기업회원 가입 승인
          </Typography>
          <Button size="small" sx={{ textTransform: 'none', color: MINT_PRIMARY_DARK, fontWeight: 600 }}>
            전체 신청 보기
          </Button>
        </Stack>

        {loading ? (
          <Stack alignItems="center" spacing={2} py={6}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              승인 대기 목록을 불러오는 중입니다...
            </Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : approvals.length === 0 ? (
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: 'center', borderColor: 'rgba(17,24,39,0.08)' }}>
            <Typography variant="subtitle1" fontWeight={600} color="#1f2937" mb={1}>
              승인 대기 중인 기업 회원이 없습니다.
            </Typography>
            <Typography variant="body2" color="#6b7280">
              새로운 가입 신청이 접수되면 이곳에서 바로 확인할 수 있어요.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {approvals.map((item) => (
              <Paper
                key={item.companyUserId}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 2.5,
                  borderColor: 'rgba(17,24,39,0.08)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={700} color="#111827">
                      {item.companyName || '회사명 미등록'}
                    </Typography>
                    <Typography variant="body2" color="#6b7280">
                      담당자 {item.contactName || '미입력'} · 접수일{' '}
                      {item.submittedDate ? dayjs(item.submittedDate).format('YYYY-MM-DD') : '미기록'}
                    </Typography>
                    <Typography variant="body2" color="#94a3b8">
                      {item.contactEmail || '이메일 미등록'} · {item.contactPhone || '연락처 미등록'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip
                      label="승인 대기"
                      size="small"
                      sx={{ bgcolor: '#e5e7eb', fontWeight: 600, borderRadius: 2, color: '#1f2937' }}
                      icon={<PendingActionsRoundedIcon fontSize="small" />}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'none', borderRadius: 2, color: '#1f2937' }}
                      onClick={() => handleOpenDialog(item)}
                    >
                      검토
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>기업 가입 신청서 검토</DialogTitle>
        <DialogContent dividers>
          {selectedApproval && (
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedApproval.companyName || '회사명 미등록'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  담당자 {selectedApproval.contactName || '미입력'} · {selectedApproval.contactEmail || '이메일 미등록'} ·{' '}
                  {selectedApproval.contactPhone || '연락처 미등록'}
                </Typography>
              </Stack>
              {selectedApproval.verificationFileUrl ? (
                <Box
                  component="img"
                  src={selectedApproval.verificationFileUrl}
                  alt="기업 인증 서류"
                  sx={{
                    width: '100%',
                    maxHeight: 380,
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid rgba(148, 163, 184, 0.4)',
                  }}
                />
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  첨부된 인증 서류가 없습니다.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            닫기
          </Button>
          <Button
            variant="contained"
            onClick={handleApprove}
            disabled={isApproving}
            sx={{ textTransform: 'none' }}
          >
            {isApproving ? '승인 중...' : '승인'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
