'use client';

import React from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Stack,
  CircularProgress,
  CardActions,
  Button,
  Chip,
  Avatar,
  useTheme,
  Alert
} from '@mui/material';
import { faLink, faIdBadge } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

const PAGE_SIZE = 20;

// React Query를 위한 데이터 호출 함수 (axios 사용)
async function fetchCompanies({ pageParam = 0 }) {
  const response = await axios.get(`/api/work24/companies?page=${pageParam}&size=${PAGE_SIZE}`);
  return response.data;
}

function CompaniesPage() {
  const theme = useTheme();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    initialPageParam: 0,
    getNextPageParam: function(lastPage, allPages) {
      // lastPage가 있고, 마지막 페이지가 아니라면 다음 페이지 번호를 반환
      return lastPage && !lastPage.last ? allPages.length : undefined;
    },
  });

  function getLogoUrl(url) {
    if (!url) return null;
    // Bug fix: work.go.kr URL이 중복되는 문제 수정
    if (url.startsWith('http')) {
        return url;
    }
    return `https://www.work.go.kr/images/recruit/${url}`;
  }

  // 초기 로딩 상태
  if (status === 'pending') {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>기업 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러 상태
  if (status === 'error') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">공채 기업 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  // companies 배열을 data.pages로부터 생성
  const companies = data.pages.flatMap(function(page) { return page.content });

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        공채 기업 정보
      </Typography>

      <Stack spacing={3}>
        {companies.map(function(company, index) {
          return (
            <Card key={company.id || index} sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              p: 3
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                        src={getLogoUrl(company.logoUrl)}
                        alt={`${company.name} logo`}
                        sx={{ width: 40, height: 40, mr: 2, border: `1px solid ${theme.palette.divider}` }}
                    >
                        {company.name ? company.name.charAt(0) : 'C'}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{company.name}</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {company.summary}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                {company.businessNumber && <Chip 
                  icon={<FontAwesomeIcon icon={faIdBadge} />} 
                  label={`사업자번호: ${company.businessNumber}`}
                  variant="outlined"
                />}
                <CardActions sx={{ p: 0 }}>
                  {company.homepage && (
                    <Button 
                      variant="contained"
                      href={company.homepage.startsWith('http') ? company.homepage : `http://${company.homepage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<FontAwesomeIcon icon={faLink} />}
                    >
                      홈페이지
                    </Button>
                  )}
                </CardActions>
              </Box>
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        {hasNextPage && (
          <Button
            onClick={function() { return fetchNextPage() }}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <CircularProgress size={24} /> : '더보기'}
          </Button>
        )}
      </Box>

      {!hasNextPage && companies.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
    </Container>
  );
}

export default CompaniesPage;
