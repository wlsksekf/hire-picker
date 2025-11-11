'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Chip,
  Button,
  Snackbar,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faMapMarkerAlt, faBriefcase, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/api'; // 공용 api 인스턴스 사용
import ResumeApplyDialog from '@/components/ResumeApplyDialog';
import useAuthStore from '@/store/authStore';

// 채용 공고 상세 페이지 컴포넌트
function PostingDetailPage() {
  const { id } = useParams(); // URL 파라미터에서 공고 ID 추출
  const [posting, setPosting] = useState(null); // 채용 공고 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const disableAuth = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 컴포넌트가 마운트되거나 ID가 변경될 때 채용 공고 정보를 불러옴
  useEffect(function() {
    if (id) {
      setLoading(true);
      api.get(`/api/work24/postings/${id}`)
        .then(function(response) {
          setPosting(response.data);
          setLoading(false);
        })
        .catch(function(err) {
          setError(err);
          setLoading(false);
        });
    }
  }, [id]);

  const normalizedPostingIdx = (data) => {
    if (!data) return null;
    return data.postingIdx ?? data.posting_idx ?? null;
  };

  function handleApplyAction() {
    if (!posting) return;
    const isInternal = Boolean(posting.internal || posting.cUserIdx);
    if (isInternal) {
      if (!disableAuth && !isAuthenticated) {
        setSnackbar({ open: true, message: '로그인이 필요합니다.', severity: 'warning' });
        window.location.href = '/login';
        return;
      }
      const postingIdx = normalizedPostingIdx(posting);
      if (!postingIdx) {
        setSnackbar({ open: true, message: '지원 정보를 찾을 수 없습니다.', severity: 'error' });
        return;
      }
      setApplyTarget({ ...posting, postingIdx });
      setApplyDialogOpen(true);
      return;
    }

    const url = posting.applyUrl || posting.homepageUrl;
    if (url) {
      const resolved = url.startsWith('http') ? url : `http://${url}`;
      window.open(resolved, '_blank', 'noopener,noreferrer');
    } else {
      setSnackbar({ open: true, message: '지원 링크가 제공되지 않았습니다.', severity: 'info' });
    }
  }

  function handleApplyDialogClose() {
    setApplyDialogOpen(false);
    setApplyTarget(null);
  }

  function handleApplySuccess(result) {
    if (result?.message) {
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success === false ? 'error' : 'success',
      });
    }
  }

  function handleSnackbarClose(event, reason) {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  }

  // 로딩 상태일 때
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>채용 공고 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러 상태일 때
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">채용 공고 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  // 채용 공고 정보가 없을 때
  if (!posting) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>채용 공고 정보를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={posting.companyLogoUrl}
            alt={`${posting.companyName} logo`}
            sx={{ width: 80, height: 80, mr: 3, border: '1px solid #e0e0e0' }}
          >
            {posting.companyName ? posting.companyName.charAt(0) : 'C'}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {posting.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {posting.companyName}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {posting.employmentType && (
            <Chip 
              icon={<FontAwesomeIcon icon={faBriefcase} />} 
              label={posting.employmentType} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {posting.location && (
            <Chip 
              icon={<FontAwesomeIcon icon={faMapMarkerAlt} />} 
              label={posting.location} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {posting.salary && (
            <Chip 
              icon={<FontAwesomeIcon icon={faMoneyBillWave} />} 
              label={posting.salary} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {posting.postedDate && (
            <Chip 
              icon={<FontAwesomeIcon icon={faCalendar} />} 
              label={`등록일: ${posting.postedDate}`} 
              color="primary" 
              variant="outlined" 
            />
          )}
        </Box>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          {posting.description}
        </Typography>

        {(posting.internal || posting.cUserIdx || posting.applyUrl || posting.homepageUrl) && (
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button variant="contained" onClick={handleApplyAction}>
              지원하기
            </Button>
          </Box>
        )}
      </Paper>

      <ResumeApplyDialog
        open={applyDialogOpen}
        job={applyTarget}
        onClose={handleApplyDialogClose}
        onSuccess={handleApplySuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PostingDetailPage;
