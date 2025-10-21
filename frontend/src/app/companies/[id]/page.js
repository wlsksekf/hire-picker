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
  Link as MuiLink
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faIdBadge, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/api'; // 공용 api 인스턴스 사용

// 기업 상세 정보 페이지 컴포넌트
function CompanyDetailPage() {
  const { id } = useParams(); // URL 파라미터에서 기업 ID 추출
  const [company, setCompany] = useState(null); // 기업 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 컴포넌트가 마운트되거나 ID가 변경될 때 기업 정보를 불러옴
  useEffect(function() {
    if (id) {
      setLoading(true);
      api.get(`/api/work24/companies/${id}`)
        .then(function(response) {
          setCompany(response.data);
          setLoading(false);
        })
        .catch(function(err) {
          setError(err);
          setLoading(false);
        });
    }
  }, [id]);

  // 로고 URL을 반환하는 함수
  function getLogoUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) {
        return url;
    }
    return `https://www.work.go.kr/images/recruit/${url}`;
  }

  // 로딩 상태일 때
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>기업 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러 상태일 때
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">기업 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  // 기업 정보가 없을 때
  if (!company) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>기업 정보를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={getLogoUrl(company.logoUrl)}
            alt={`${company.name} logo`}
            sx={{ width: 80, height: 80, mr: 3, border: '1px solid #e0e0e0' }}
          >
            {company.name ? company.name.charAt(0) : 'C'}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {company.name}
            </Typography>
            {company.companyType && (
              <Chip 
                icon={<FontAwesomeIcon icon={faBuilding} />} 
                label={company.companyType} 
                color="primary" 
                variant="outlined" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        <Typography variant="body1" paragraph sx={{ mt: 3 }}>
          {company.description}
        </Typography>

        <Box sx={{ mt: 3 }}>
          {company.businessNumber && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <FontAwesomeIcon icon={faIdBadge} style={{ marginRight: '8px' }} />
              사업자번호: {company.businessNumber}
            </Typography>
          )}
          {company.homepage && (
            <Typography variant="body2" color="text.secondary">
              <FontAwesomeIcon icon={faLink} style={{ marginRight: '8px' }} />
              홈페이지: 
              <MuiLink 
                href={company.homepage.startsWith('http') ? company.homepage : `http://${company.homepage}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 0.5 }}
              >
                {company.homepage}
              </MuiLink>
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default CompanyDetailPage;