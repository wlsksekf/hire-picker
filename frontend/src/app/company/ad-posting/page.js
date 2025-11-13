"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add,
  Delete,
  Visibility,
  TrendingUp,
  CalendarToday,
  MonetizationOn
} from '@mui/icons-material';
import { api } from '@/api';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';

/**
 * 회사회원용 광고 공고 관리 페이지
 * 기존 채용공고를 선택해서 광고로 등록
 */
export default function AdPostingManagePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [adPostings, setAdPostings] = useState([]);
  const [myJobPostings, setMyJobPostings] = useState([]); // 내 채용공고 목록
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState(null);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30일 후
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'COMPANY') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // 광고 목록 및 내 채용공고 목록 조회
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'COMPANY') {
      fetchMyAdPostings();
      fetchMyJobPostings();
    }
  }, [isAuthenticated, user]);

  const fetchMyAdPostings = async () => {
    try {
      const response = await api.get('/api/ad-postings/my');
      if (response.data.success) {
        setAdPostings(response.data.adPostings);
      }
    } catch (error) {
      console.error('[광고 공고] 조회 실패:', error);
      setError('광고 공고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobPostings = async () => {
    try {
      // 내 채용공고 목록 조회
      const response = await api.get('/api/posting/my-postings?page=0&size=100');
      if (response.data) {
        const postings = response.data._embedded?.jobDtoList || response.data.content || [];
        setMyJobPostings(postings);
      }
    } catch (error) {
      console.error('[채용공고] 조회 실패:', error);
    }
  };

  // 광고 등록 다이얼로그 열기
  const handleOpenDialog = () => {
    setSelectedJobPosting(null);
    setFormData({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setOpenDialog(true);
    setError(null);
    setSuccess(null);
  };

  // 광고 등록
  const handleSubmit = async () => {
    try {
      setError(null);

      // 유효성 검사
      if (!selectedJobPosting) {
        setError('광고로 등록할 채용공고를 선택해주세요.');
        return;
      }

      // 날짜를 LocalDateTime 형식으로 변환
      const requestData = {
        postingIdx: selectedJobPosting.id,
        startDate: new Date(formData.startDate + 'T00:00:00').toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59').toISOString()
      };

      const response = await api.post('/api/ad-postings', requestData);

      if (response.data.success) {
        setSuccess('광고가 등록되었습니다. 메인 페이지에 즉시 노출됩니다!');
        setOpenDialog(false);
        fetchMyAdPostings(); // 목록 새로고침
      }
    } catch (error) {
      console.error('[광고 공고] 등록 실패:', error);
      const errorMessage = error.response?.data?.message || '광고 등록에 실패했습니다.';
      setError(errorMessage);
    }
  };

  // 광고 삭제
  const handleDelete = async (adPostingId) => {
    if (!confirm('정말 이 광고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/ad-postings/${adPostingId}`);
      if (response.data.success) {
        setSuccess('광고가 삭제되었습니다.');
        fetchMyAdPostings();
      }
    } catch (error) {
      console.error('[광고 공고] 삭제 실패:', error);
      setError('광고 삭제에 실패했습니다.');
    }
  };

  // 상태 배지 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'EXPIRED': return 'default';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  // 상태 텍스트
  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return '활성';
      case 'PENDING': return '대기중';
      case 'EXPIRED': return '종료됨';
      case 'REJECTED': return '거절됨';
      default: return status;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          📢 광고 공고 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          size="large"
          disabled={myJobPostings.length === 0}
        >
          광고 등록 (10,000 크레딧)
        </Button>
      </Box>

      {/* 안내 메시지 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          💡 <strong>기존 채용공고</strong>를 선택해서 메인 페이지 상단에 광고로 노출할 수 있습니다.
          <br />
          광고 1개당 <strong>10,000 크레딧</strong>이 차감되며, 즉시 메인 페이지에 노출됩니다.
        </Typography>
      </Alert>

      {/* 알림 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* 광고 목록 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        현재 광고 중인 공고
      </Typography>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Typography>로딩 중...</Typography>
          </Grid>
        ) : adPostings.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  등록된 광고가 없습니다
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  채용공고를 광고로 등록하여 더 많은 구직자에게 노출하세요!
                </Typography>
                {myJobPostings.length > 0 ? (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenDialog}
                  >
                    첫 광고 등록하기
                  </Button>
                ) : (
                  <Typography variant="body2" color="error">
                    먼저 채용공고를 등록해주세요.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          adPostings.map((ad) => {
            const job = ad.jobPosting || {};
            return (
              <Grid item xs={12} md={6} key={ad.adPostingId}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    {/* 상태 배지 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={getStatusText(ad.status)}
                        color={getStatusColor(ad.status)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        ID: {ad.adPostingId}
                      </Typography>
                    </Box>

                    {/* 공고 제목 */}
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {job.title}
                    </Typography>

                    {/* 회사명 */}
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                      {job.companyName}
                    </Typography>

                    {/* 통계 */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Tooltip title="조회수">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Visibility sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">{ad.viewCount?.toLocaleString() || 0}</Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="클릭수">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingUp sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">{ad.clickCount?.toLocaleString() || 0}</Typography>
                        </Box>
                      </Tooltip>
                    </Box>

                    {/* 기간 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(ad.startDate).toLocaleDateString()} ~ {new Date(ad.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* 사용 크레딧 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MonetizationOn sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption" color="primary">
                        {ad.creditAmount?.toLocaleString()} 크레딧
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(ad.adPostingId)}
                    >
                      삭제
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* 광고 등록 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          광고 등록 (10,000 크레딧)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* 채용공고 선택 */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              광고로 등록할 채용공고 선택 *
            </Typography>
            <Card variant="outlined" sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
              <List>
                {myJobPostings.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="등록된 채용공고가 없습니다." 
                      secondary="먼저 채용공고를 등록해주세요."
                    />
                  </ListItem>
                ) : (
                  myJobPostings.map((job) => (
                    <React.Fragment key={job.id}>
                      <ListItemButton
                        selected={selectedJobPosting?.id === job.id}
                        onClick={() => setSelectedJobPosting(job)}
                      >
                        <Radio checked={selectedJobPosting?.id === job.id} />
                        <ListItemText
                          primary={job.title}
                          secondary={`${job.location || '위치 미정'} · ${job.employmentType || '고용형태 미정'}`}
                        />
                      </ListItemButton>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Card>

            {/* 기간 설정 */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              광고 기간 설정
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="시작 날짜 *"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="종료 날짜 *"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Alert severity="warning">
              광고 등록 시 <strong>10,000 크레딧</strong>이 즉시 차감되며,
              메인 페이지 상단에 바로 노출됩니다.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!selectedJobPosting}
          >
            등록 (10,000 크레딧 차감)
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
