'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardActions,
  Box,
  Stack,
  useTheme,
  Chip,
  CircularProgress,
  Avatar,
  Button,
  Alert
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/api'; // 공용 api 인스턴스 사용

const PAGE_SIZE = 20; // 페이지 당 불러올 채용 공고 수

// 메인 페이지 컴포넌트
function MainPage() {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]); // 채용 공고 목록
  const [page, setPage] = useState(0); // 현재 페이지 번호
  const [hasNextPage, setHasNextPage] = useState(true); // 다음 페이지 존재 여부
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false); // 다음 페이지 로딩 중 여부
  const [status, setStatus] = useState('pending'); // 데이터 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 채용 공고를 불러오는 함수
  async function fetchJobs(pageNum) {
    setIsFetchingNextPage(true);
    try {
      const response = await api.get(`/api/work24/jobs?page=${pageNum}&size=${PAGE_SIZE}`);
      const data = response.data;
      
      setJobs(prevJobs => {
        const newJobs = data.content;
        const existingIds = new Set(prevJobs.map(j => j.id));
        const uniqueNewJobs = newJobs.filter(j => !existingIds.has(j.id)); // 중복 제거
        return [...prevJobs, ...uniqueNewJobs];
      });

      setHasNextPage(!data.last); // 마지막 페이지인지 확인
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    } finally {
      setIsFetchingNextPage(false);
    }
  }

  // 컴포넌트가 마운트될 때 첫 페이지의 채용 공고를 불러옴
  useEffect(function() {
    fetchJobs(0);
  }, []);

  // 다음 페이지의 채용 공고를 불러오는 함수
  function fetchNextPage() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage);
  }

  // 로고 URL을 반환하는 함수
  function getLogoUrl(url) {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      return `https://www.work.go.kr/images/recruit/${url}`;
  }

  // 초기 로딩 상태일 때
  if (status === 'pending') {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>채용 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러가 발생했을 때
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">채용 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2.5rem', sm: '3.75rem' } }}>
          Just Pick.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          사람과 기업을 검색하세요
        </Typography>
      </Box>

      <Box sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          전체 채용공고
        </Typography>
        <Stack spacing={3}>
          {jobs.map(function(job) {
            return (
              <Card key={job.id} sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                width: '100%', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                p: { xs: 2, sm: 3 }
              }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                        src={getLogoUrl(job.logoUrl)}
                        alt={`${job.companyName} logo`}
                        sx={{ width: 40, height: 40, mr: 2, border: `1px solid ${theme.palette.divider}` }}
                    >
                        {job.companyName ? job.companyName.charAt(0) : 'C'}
                    </Avatar>
                    <Typography variant="body1" color="text.secondary">{job.companyName}</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold">{job.title}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {job.employmentType && <Chip label={job.employmentType} sx={{ backgroundColor: theme.palette.filters.employmentType, color: 'black', fontWeight: 'bold' }} />}
                    {job.location && <Chip label={job.location} sx={{ backgroundColor: theme.palette.filters.companyType, color: 'black', fontWeight: 'bold' }} />}
                    {job.startDate && job.endDate && <Chip icon={<FontAwesomeIcon icon={faCalendar} />} label={`${job.startDate} ~ ${job.endDate}`} />}
                  </Box>
                </Box>
                <CardActions sx={{ p: 0, mt: 2, alignSelf: 'flex-end' }}>
                  <Button 
                      variant="contained"
                      href={job.homepageUrl && (job.homepageUrl.startsWith('http') ? job.homepageUrl : `http://${job.homepageUrl}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      disabled={!job.homepageUrl}
                    >
                      지원하기
                    </Button>
                </CardActions>
              </Card>
            )
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

        {!hasNextPage && jobs.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
      </Box>
    </Container>
  );
}

export default MainPage;