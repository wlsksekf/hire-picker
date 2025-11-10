'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { api } from '@/api';
import JobPostingForm from '@/components/JobPostingForm';

// 개인회원 스타일과 동일한 카드
const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  boxShadow: '0 16px 32px rgba(10, 10, 10, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  backgroundColor: '#ffffff',
}));

/**
 * 채용공고 수정 페이지
 *
 * 경로: /mypage/company/postings/edit/[id]
 *
 * 기능:
 * 1. 기존 채용공고 정보 불러오기 (GET /api/companies/my/job-postings/{id})
 * 2. 수정된 정보 저장 (PUT /api/companies/my/job-postings/{id})
 */
export default function EditJobPosting() {
  const params = useParams();
  const router = useRouter();
  const postingId = params.id;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 채용공고 정보 불러오기
  useEffect(() => {
    if (!postingId) return;

    console.log('[EditJobPosting] 채용공고 조회 시작. ID:', postingId);

    api.get(`/api/companies/my/job-postings/${postingId}`)
      .then(response => {
        console.log('[EditJobPosting] 채용공고 조회 성공:', response.data);

        // LocalDate 포맷팅 (YYYY-MM-DD)
        const formattedData = {
          ...response.data,
          startDate: response.data.startDate ? formatDateForInput(response.data.startDate) : '',
          endDate: response.data.endDate ? formatDateForInput(response.data.endDate) : '',
        };

        setInitialData(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('[EditJobPosting] 채용공고 조회 실패:', err);
        const errorMsg = err.response?.data?.message || '채용공고를 불러오는데 실패했습니다.';
        setError(errorMsg);
        setLoading(false);
      });
  }, [postingId]);

  // 날짜 포맷 변환: LocalDateTime -> YYYY-MM-DD
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // LocalDate는 "2025-11-10" 형식, LocalDateTime은 "2025-11-10T12:34:56" 형식
    return dateStr.split('T')[0];
  };

  // 폼 제출 핸들러
  const handleSubmit = (formData) => {
    console.log('[EditJobPosting] 수정 요청 데이터:', formData);

    setSaving(true);
    setError(null);

    api.put(`/api/companies/my/job-postings/${postingId}`, formData)
      .then(response => {
        console.log('[EditJobPosting] 수정 성공:', response.data);
        alert('채용공고가 성공적으로 수정되었습니다!');
        router.push('/mypage/company/postings');
      })
      .catch(err => {
        console.error('[EditJobPosting] 수정 실패:', err);
        const errorMsg = err.response?.data?.message || '채용공고 수정에 실패했습니다.';
        setError(errorMsg);
        setSaving(false);
      });
  };

  // 로딩 중
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>채용공고를 불러오는 중...</Typography>
        </Box>
      </Container>
    );
  }

  // 에러 발생
  if (error && !initialData) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ borderRadius: '16px' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* 페이지 헤더 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            채용공고 수정
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            채용공고 정보를 수정하고 저장하세요
          </Typography>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
            {error}
          </Alert>
        )}

        {/* 폼 카드 */}
        <SectionCard>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <JobPostingForm
              initialData={initialData}
              onSubmit={handleSubmit}
              isLoading={saving}
              submitButtonText="수정 완료"
              mode="edit"
            />
          </CardContent>
        </SectionCard>
      </Box>
    </Container>
  );
}
