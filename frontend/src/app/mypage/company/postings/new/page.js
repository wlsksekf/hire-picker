'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
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
 * 채용공고 등록 페이지
 *
 * 경로: /mypage/company/postings/new
 *
 * 기능:
 * 1. 새로운 채용공고 작성
 * 2. 서버에 저장 (POST /api/companies/my/job-postings)
 */
export default function NewJobPosting() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 폼 제출 핸들러
  const handleSubmit = (formData) => {
    console.log('[NewJobPosting] 등록 요청 데이터:', formData);

    setSaving(true);
    setError(null);

    api.post('/api/companies/my/job-postings', formData)
      .then(response => {
        console.log('[NewJobPosting] 등록 성공:', response.data);
        alert('채용공고가 성공적으로 등록되었습니다!');
        router.push('/mypage/company/postings'); // 목록으로 이동
      })
      .catch(err => {
        console.error('[NewJobPosting] 등록 실패:', err);
        const errorMsg = err.response?.data?.message || '채용공고 등록에 실패했습니다.';
        setError(errorMsg);
        setSaving(false);
      });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* 페이지 헤더 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            채용공고 등록
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575' }}>
            새로운 채용공고를 작성하고 등록하세요
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
              initialData={{}} // 빈 객체 (새 등록)
              onSubmit={handleSubmit}
              isLoading={saving}
              submitButtonText="등록하기"
              mode="create"
            />
          </CardContent>
        </SectionCard>
      </Box>
    </Container>
  );
}

