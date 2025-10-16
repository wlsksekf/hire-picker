'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Button
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

const PAGE_SIZE = 20;
const MAX_ITEMS = 100;

const MainPage = () => {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchJobs = useCallback(async () => {
    if (loading || !hasMore || jobs.length >= MAX_ITEMS) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/work24/jobs?page=${page}&size=${PAGE_SIZE}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      
      setJobs(prevJobs => {
        const existingIds = new Set(prevJobs.map(j => j.id));
        const newJobs = data.content.filter(j => !existingIds.has(j.id));
        return [...prevJobs, ...newJobs];
      });

      setPage(prevPage => prevPage + 1);
      setHasMore(!data.last && (jobs.length + data.content.length < MAX_ITEMS));
    } catch (error) {
      console.error("채용 정보를 가져오는 데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, jobs.length]);

  useEffect(() => {
    fetchJobs(); // Initial fetch
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lastJobElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchJobs();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchJobs]);

  const getLogoUrl = (url) => {
      if (!url) return null;
      return `https://www.work.go.kr/images/recruit/${url}`;
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
          {jobs.map((job, index) => {
            const cardContent = (
              <Card key={job.id || index} sx={{ 
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
            );
            if (jobs.length === index + 1) {
                return <div key={job.id || index} ref={lastJobElementRef}>{cardContent}</div>;
            }
            return cardContent;
          })}
        </Stack>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
        {!hasMore && jobs.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
      </Box>
    </Container>
  );
};

export default MainPage;
