'use client';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Card,
  CardActions
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@mui/material/styles';
import ChatRoom from '@/components/ChatRoom';
import SearchFilterBar from '@/components/SearchFilterBar';
import Bookmark from '@/components/BookMark';
import JobDetailModal from '@/components/JobDetailModal';

const PAGE_SIZE = 18;

function MainPage() {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null); // 상세 공고 모달용

  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    jobType: [],
    location: [],
    employmentType: [],
    experienceLevel: [],
    companyType: [],
    source: [],
  });

  const fetchJobs = useCallback((pageNum, searchTerm, filters, options = {}) => {
    const silent = options.silent === true;

    if (!silent) {
      if (pageNum === 0) {
        setStatus('pending');
        setJobs([]);
      } else {
        setIsFetchingNextPage(true);
      }
    }

    const requestbody = {
      searchTerm: searchTerm || '',
      filters: filters
    };

    axios.post(`/api/search?page=${pageNum}&size=${PAGE_SIZE}`, requestbody)
      .then(function (res) {
        const data = res.data;
        const newJobs = data._embedded ? data._embedded.jobDtoList : (data.content || []);

        setJobs(function (prev) {
          const merged = pageNum === 0 ? newJobs : [...prev, ...newJobs];
          const unique = merged.filter((job, index, self) =>
            index === self.findIndex(j => j.id === job.id)
          );
          return unique;
        });

        const isLast = data.page ? data.page.number >= data.page.totalPages - 1 : false;
        setHasNextPage(!isLast);
        if (!silent) {
          setStatus('success');
        }
      })
      .catch(function (err) {
        setError(err);
        if (!silent) {
          setStatus('error');
        }
      })
      .finally(function () {
        if (!silent) {
          setIsFetchingNextPage(false);
        }
      });
  }, []);

  useEffect(function () {
    fetchJobs(0, appliedSearchTerm, appliedFilters);
  }, [fetchJobs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const eventSource = new EventSource('/api/postings/stream', { withCredentials: true });

    const handleEvent = () => {
      fetchJobs(0, appliedSearchTerm, appliedFilters, { silent: true });
    };

    eventSource.addEventListener('cUserChanged', handleEvent);
    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener('cUserChanged', handleEvent);
      eventSource.close();
    };
  }, [fetchJobs, appliedSearchTerm, appliedFilters]);

  function handleSearchAndFilter(term, filters, responseData) {
    setAppliedSearchTerm(term);
    setAppliedFilters(filters);
    setPage(0);

    if (responseData && responseData.content) {
      setJobs(responseData.content);
      setHasNextPage(responseData.last === false);
      setStatus('success');
    } else {
      setJobs([]);
      setHasNextPage(false);
      setStatus('success');
    }
  }

  function fetchNextPage() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, appliedSearchTerm, appliedFilters);
  }

  function handleApplyClick(job, event) {
    event.stopPropagation();
    if (job.internal) {
      setSelectedJob(job);
      return;
    }
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
  }

  if (status === 'pending' && jobs.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>채용 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">
          채용 정보를 가져오는 데 실패했습니다: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Just Pick.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          사람과 기업을 검색하세요
        </Typography>
        <SearchFilterBar onSearchAndFilter={handleSearchAndFilter} />
      </Box>

      <Box sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          전체 채용공고
        </Typography>

        <Grid container spacing={3}>
          {jobs.map(function (job) {
            return (
              <Grid key={job.id || `${job.companyName}-${job.title}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                   sx={{
                    borderRadius: '16px',
                    height: '100%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, box-shadow 0.2s', // 부드럽게
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover, // 살짝 빛나는 느낌
                      boxShadow: '0 6px 16px rgba(0,0,0,0.1)', // 약간 그림자 강조
                    },
                  }}
                  onClick={() => setSelectedJob(job)} // 카드 클릭 시 상세 모달
                >
                  <Box sx={{
                    height: '180px',
                    backgroundImage: job.imgUrl ? `url(/${job.imgUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: theme.palette.grey[200],
                  }} />
                  <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: 'calc(100% - 180px)'
                  }}>
                    <Typography color="text.secondary" noWrap>
                      {job.companyName}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {job.employmentType && <Chip label={job.employmentType} />}
                      {job.location && <Chip label={job.location} />}
                      {job.experience_level && <Chip label={job.experience_level} />}
                      {job.companyType && <Chip label={job.companyType} />}
                      {job.jobType && <Chip label={job.jobType} />}
                      {job.startDate && job.endDate && (
                        <Chip
                          icon={<FontAwesomeIcon icon={faCalendar} />}
                          label={`${job.startDate} ~ ${job.endDate}`}
                        />
                      )}
                    </Box>
                    <CardActions sx={{ mt: 2, justifyContent: 'flex-end' }}>
                        <Box onClick={(e) => e.stopPropagation()}>
                        <Bookmark jobId={job.id} />
                        </Box>
                      <Button
                        variant="outlined"
                        onClick={(e) => { e.stopPropagation(); setSelectedPost(job); }} // 채팅 독립
                      >
                        실시간 채팅
                      </Button>
                      <Button
                        variant="contained"
                        disabled={!job.internal && !job.applyUrl}
                        onClick={(e) => handleApplyClick(job, e)}
                      >
                        지원하기
                      </Button>
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          {hasNextPage && (
            <Button onClick={fetchNextPage} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? <CircularProgress size={24} /> : '더보기'}
            </Button>
          )}
        </Box>
      </Box>

      {selectedPost && (
        <ChatRoom post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </Container>
  );
}

export default MainPage;
