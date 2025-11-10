'use client';

import React, { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add,
  Description,
  Edit,
  Update,
  Visibility,
  VisibilityOff,
  DeleteOutline,
} from '@mui/icons-material';
import { Switch, FormControlLabel } from '@mui/material';
import { deleteResume, updateResumeStatus } from '@/api';

const PageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  minHeight: '100vh',
  padding: theme.spacing(6, 0, 10),
}));

const HeaderCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 24,
  padding: theme.spacing(5),
  color: '#1f2937',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)',
  gap: theme.spacing(4),
}));

const SummaryCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 20,
  padding: theme.spacing(3),
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  border: '1px solid rgba(148, 163, 184, 0.16)',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

const SummaryIcon = styled(Avatar)(({ theme }) => ({
  backgroundColor: '#f1f5f9',
  color: '#0f172a',
  width: 44,
  height: 44,
}));

const ResumeCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 24,
  padding: theme.spacing(3),
  border: '1px solid rgba(148, 163, 184, 0.14)',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 20px 44px rgba(15, 23, 42, 0.14)',
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  height: 26,
  fontWeight: 600,
  borderRadius: 16,
  padding: '0 10px',
  backgroundColor: status === 'PUBLIC' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(148, 163, 184, 0.16)',
  color: status === 'PUBLIC' ? '#0284c7' : '#475569',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  border: '1px dashed rgba(148, 163, 184, 0.4)',
  borderRadius: 24,
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: '#ffffff',
  color: '#475569',
}));

const mapStatusToLabel = (status) => {
  if (!status) return '미정';
  return status === 'PUBLIC' ? '공개' : '비공개';
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
  } catch {
    return '-';
  }
};

export default function ResumesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/resumes', {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`목록 조회 실패: ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        const mapped = (Array.isArray(data) ? data : []).map((d) => ({
          id: d.id,
          title: d.title || '(제목 없음)',
          status: d.status || null,
          lastModified: d.modifiedDate || d.updatedAt || null,
        }));
        setRows(mapped);
      } catch (e) {
        if (!ignore) setError(e.message || '목록을 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // 이력서 삭제 요청을 준비한다.
  const handleDeleteRequest = (resume) => {
    setDeleteTarget(resume);
    setDeleteDialogOpen(true);
  };

  // 삭제 다이얼로그를 닫는다.
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // 실제 삭제를 수행한다.
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteResume(deleteTarget.id);
      setRows((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setSuccessMessage('이력서를 삭제했습니다.');
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      const message = e?.response?.data?.message || '이력서 삭제에 실패했습니다.';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (resume) => {
    const nextStatus = resume.status === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    const previousStatus = resume.status;
    setTogglingId(resume.id);
    setRows((prev) =>
      prev.map((item) =>
        item.id === resume.id ? { ...item, status: nextStatus } : item
      )
    );
    try {
      await updateResumeStatus(resume.id, nextStatus);
    } catch (e) {
      const message = e?.response?.data?.message || '공개 상태 변경에 실패했습니다.';
      setError(message);
      setRows((prev) =>
        prev.map((item) =>
          item.id === resume.id ? { ...item, status: previousStatus } : item
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  const totalResumes = rows.length;
  const publicResumes = rows.filter((item) => item.status === 'PUBLIC').length;
  const privateResumes = rows.filter((item) => item.status === 'PRIVATE').length;
  const latestResume = useMemo(() => {
    if (rows.length === 0) return null;
    return [...rows].sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0))[0];
  }, [rows]);

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <HeaderCard>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                내 이력서 허브
              </Typography>
              <Typography sx={{ opacity: 0.75, fontSize: 16 }}>
                작성한 이력서를 한눈에 관리하고, 공개 상태를 유연하게 조정해 보세요.
              </Typography>
            </Box>
            <Button
              component={NextLink}
              href="/mypage/personal/write_resume"
              variant="contained"
              color="primary"
              startIcon={<Add />}
              sx={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                fontWeight: 700,
                px: 3.5,
                py: 1.4,
                borderRadius: 14,
                '&:hover': {
                  backgroundColor: '#0ea5e9',
                  color: '#0f172a',
                },
              }}
            >
              새 이력서 작성
            </Button>
          </HeaderCard>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SummaryCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SummaryIcon>
                        <Description />
                      </SummaryIcon>
                      <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        전체 이력서
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {totalResumes}
                    </Typography>
                  </SummaryCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <SummaryCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SummaryIcon>
                        <Update />
                      </SummaryIcon>
                      <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        최근 수정
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {latestResume ? latestResume.title : '없음'}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                        {latestResume ? formatDateLabel(latestResume.lastModified) : ''}
                      </Typography>
                    </Box>
                  </SummaryCard>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SummaryCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SummaryIcon>
                        <Visibility />
                      </SummaryIcon>
                      <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        공개 중
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#0284c7' }}>
                      {publicResumes}
                    </Typography>
                  </SummaryCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <SummaryCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SummaryIcon>
                        <VisibilityOff />
                      </SummaryIcon>
                      <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600 }}>
                        비공개
                      </Typography>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#475569' }}>
                      {privateResumes}
                    </Typography>
                  </SummaryCard>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

        {successMessage && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}

          {error && (
            <Box
              sx={{
                borderRadius: 16,
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                px: 3,
                py: 2,
              }}
            >
              {error}
            </Box>
          )}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: '#64748b' }}>이력서를 불러오는 중입니다…</Typography>
            </Box>
          ) : rows.length === 0 ? (
            <EmptyState>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                아직 등록한 이력서가 없어요
              </Typography>
              <Typography sx={{ mb: 3 }}>
                첫 이력서를 작성하고, 나만의 커리어 스토리를 만들어 보세요.
              </Typography>
              <Button
                component={NextLink}
                href="/mypage/personal/write_resume"
                variant="contained"
                startIcon={<Add />}
                sx={{
                  borderRadius: 12,
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                }}
              >
                새 이력서 작성
              </Button>
            </EmptyState>
          ) : (
            <Stack spacing={3}>
              {rows.map((resume) => (
                <ResumeCard key={resume.id}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="space-between">
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography
                          component={NextLink}
                          href={`/mypage/personal/resumes/${resume.id}`}
                          sx={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#0f172a',
                            textDecoration: 'none',
                            '&:hover': { color: '#0284c7' },
                          }}
                        >
                          {resume.title}
                        </Typography>
                        <StatusChip label={mapStatusToLabel(resume.status)} status={resume.status} />
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={resume.status === 'PUBLIC'}
                              onChange={() => handleToggleStatus(resume)}
                              disabled={togglingId === resume.id}
                            />
                          }
                          label="공개"
                          labelPlacement="start"
                          sx={{ m: 0, ml: 1, '.MuiFormControlLabel-label': { fontSize: 12, color: '#475569' } }}
                        />
                      </Stack>

                      <Typography sx={{ color: '#64748b', fontSize: 14 }}>
                        마지막 수정일 · {formatDateLabel(resume.lastModified)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Button
                        component={NextLink}
                        href={`/mypage/personal/resumes/${resume.id}`}
                        variant="outlined"
                        startIcon={<Description />}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 12,
                          fontWeight: 600,
                        }}
                      >
                        상세보기
                      </Button>
                      <IconButton
                        component={NextLink}
                        href={`/mypage/personal/resumes/${resume.id}/edit`}
                        sx={{
                          backgroundColor: 'rgba(14, 165, 233, 0.12)',
                          color: '#0284c7',
                          '&:hover': {
                            backgroundColor: 'rgba(14, 165, 233, 0.2)',
                          },
                        }}
                        aria-label="편집"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        sx={{
                          backgroundColor: 'rgba(248, 113, 113, 0.12)',
                          color: '#dc2626',
                          '&:hover': {
                            backgroundColor: 'rgba(248, 113, 113, 0.22)',
                          },
                        }}
                        aria-label="삭제"
                        disabled={deleting}
                        onClick={() => handleDeleteRequest(resume)}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.16)' }} />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ color: '#475569', fontSize: 14 }}>
                    <Box sx={{ minWidth: 160 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        상태
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>{mapStatusToLabel(resume.status)}</Typography>
                    </Box>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        최근 업데이트
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>{formatDateLabel(resume.lastModified)}</Typography>
                    </Box>
                  </Stack>
                </ResumeCard>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>이력서를 삭제할까요?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `'${deleteTarget.title}' 이력서를 삭제하면 복구할 수 없습니다.`
              : '선택된 이력서 정보가 없습니다.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}

