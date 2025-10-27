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
  Chip,
  Link as MuiLink,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLink,
  faIdBadge,
  faBuilding,
  faUser,
  faMapMarkerAlt,
  faUsers,
  faFileAlt,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { api } from '@/api';

const styles = {
  container: {
    minHeight: '100vh',
    py: 3,
  },
  paper: {
    p: 3,
    borderRadius: '8px',
    mb: 3,
    background: '#fff',
    border: '1px solid #e9ecef',
  },
  title: {
    color: '#333',
    fontWeight: 600,
    mb: 1,
    fontSize: '1.75rem',
  },
  chip: {
    backgroundColor: '#f8f9fa',
    color: '#495057',
    fontWeight: 500,
    fontSize: '0.875rem',
    border: '1px solid #e9ecef',
  },
  sectionTitle: {
    color: '#333',
    fontWeight: 600,
    mb: 1.5,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    height: '100%',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    p: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  infoLabel: {
    display: 'block',
    mb: 0.5,
    color: 'text.secondary',
    fontSize: '0.875rem',
  },
  infoValue: {
    color: '#495057',
    fontSize: '0.95rem',
  },
  link: {
    color: '#1e88e5',
    textDecoration: 'none',
    fontSize: '0.875rem',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
};

function CompanyDetailPage() {
  const { idx } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (idx) {
      setLoading(true);
      api
        .get(`/api/work24/companies/${idx}`)
        .then(response => {
          setCompany(response.data);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    }
  }, [idx]);

  function getLogoUrl(url) {
    if (!url) return null;
    return url.startsWith('http') ? url : `https://www.work.go.kr/images/recruit/${url}`;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ color: '#1e88e5' }} />
        <Typography sx={{ mt: 2, color: '#666' }}>기업 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">기업 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">기업 정보를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  // entity 필드 매핑
  const infoList = [
    {
      label: '대표자',
      value: company.ceoName || company.ceoNm,
      icon: faUser,
    },
    {
      label: '직원 수',
      value: company.employeeCount,
      icon: faUsers,
    },
    {
      label: '주소',
      value: company.address || company.adres,
      icon: faMapMarkerAlt,
    },
    {
      label: '업종',
      value: company.industryCategory,
      icon: faFileAlt,
    },
    {
      label: '웹사이트',
      value: company.websiteUrl || company.homepage,
      icon: faLink,
      isLink: true,
    },
  ];

  const reviewList = [
    {
      label: '회사 연혁',
      value: company.companyHistory,
    },
    {
      label: '사업 영역',
      value: company.businessAreas,
    },
    {
      label: '주요 제품',
      value: company.mainProducts,
    },
    {
      label: '기업 문화',
      value: company.companyCulture,
    },
    {
      label: '근무 환경',
      value: company.workEnvironment,
    },
    {
      label: '연봉대',
      value: company.salaryRange,
    },
  ];

  return (
    <Box sx={styles.container}>
      <Container maxWidth="lg">
        <Paper elevation={1} sx={styles.paper}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {getLogoUrl(company.logoUrl) ? (
            <Box
              component="img"
              src={getLogoUrl(company.logoUrl)}
              alt={`${company.companyName || company.name} logo`}
              sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  objectFit: 'contain',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px'
              }}
            />
          ) : (
            <Box
              sx={{
                  width: 80,
                  height: 80,
                  mr: 3,
                  backgroundColor: '#fff',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px'
              }}
            />
          )}
            <Box>
              <Typography variant="h4" component="h1" sx={styles.title}>
                {company.companyName || company.name}
              </Typography>
              {company.companyType && (
                <Chip
                  icon={<FontAwesomeIcon icon={faBuilding} />}
                  label={company.companyType}
                  sx={styles.chip}
                />
              )}
            </Box>
          </Box>

          {/* 기업 주요 정보 가로 나열 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {infoList
              .filter(item => item.value)
              .map(item => (
                <Box key={item.label} sx={styles.infoBox}>
                  <FontAwesomeIcon
                    icon={item.icon}
                    style={{ color: '#666', width: '16px', marginRight: '12px' }}
                  />
                  <Box>
                    <Typography variant="caption" sx={styles.infoLabel}>
                      {item.label}
                    </Typography>
                    {item.isLink ? (
                      <MuiLink
                        href={item.value.startsWith('http') ? item.value : `http://${item.value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={styles.link}
                      >
                        {item.value}
                      </MuiLink>
                    ) : (
                      <Typography variant="body2" sx={styles.infoValue}>
                        {item.value}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
          </Box>

          {/* 리뷰 스타일: 기업 상세 정보 */}
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {reviewList
                .filter(item => item.value)
                .map(item => (
                  <Grid item xs={12} md={6} key={item.label}>
                    <Card elevation={0} sx={{ ...styles.card, background: 'none', border: 'none' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={styles.sectionTitle}>
                          {item.label}
                        </Typography>
                        <Typography variant="body2" sx={styles.infoValue}>
                          {item.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default CompanyDetailPage;