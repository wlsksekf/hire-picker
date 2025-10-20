'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { 
    Container, 
    Typography, 
    CircularProgress, 
    Alert, 
    Box, 
    Button, 
    Grid, 
    Paper,
    Divider,
    Chip
} from '@mui/material';
import { faShareAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar } from '@mui/material';

export default function CompanyDetailPage() {
  const params = useParams();
  const id = params.id;

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`/api/work24/companies/${id}`)
        .then(response => {
          setCompany(response.data);
          setError(null);
        })
        .catch(err => {
          setError(err);
          setCompany(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  function getLogoUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) {
        return url;
    }
    return `https://www.work.go.kr/images/recruit/${url}`;
  }

  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>회사 정보를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">
          회사 정보를 불러오는 데 실패했습니다: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="info">회사 정보를 찾을 수 없습니다.</Alert>
      </Container>
    );
  }

  return (
    <Box>
      <Container maxWidth="md" sx={{ mt: -10 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, marginTop: 10 }}>
        </Box>
        <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', position: 'relative', zIndex: 10 }}>
            <Box sx={{ mb: 3, textAlign: 'left' }}>
                <Box
                    component="img"
                    src={getLogoUrl(company.logoUrl)}
                    alt={`${company.name} logo`}
                    sx={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain', display: 'inline-block' }}
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {company.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={`${company.companytype||'중소기업'}`} size="small" />
                        <Chip label={`직원수 ${company.employeeCount || '-'}명`} size="small" />
                        <Chip label={`업력 ${company.employeeCount || '-'}년`} size="small" />
                    </Box>
                </Box>
                <Box>
                    <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faStar} />} sx={{ mr: 1 }}>
                        관심기업 등록
                    </Button>
                    <Button variant="outlined" startIcon={<FontAwesomeIcon icon={faShareAlt} />}>
                        공유하기
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    기업 소개
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {company.summary || '기업 소개 정보가 없습니다.'}
                </Typography>
            </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                리뷰 정보 (Placeholder)
            </Typography>
            <Typography variant="body1" color="text.secondary">
                이 영역에는 사람인 웹사이트처럼 기업 리뷰 관련 통계 및 개별 리뷰가 표시될 예정입니다.
            </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
