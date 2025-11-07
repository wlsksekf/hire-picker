  'use client';
  import React, { useState, useEffect } from 'react';
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
  import SearchFilterBar from '@/components/SearchFilterBar'; // ✅ 검색 + 필터 컴포넌트
import Bookmark from '@/components/BookMark';

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

    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({
      jobType: [],
      location: [],
      employmentType: [],
      experienceLevel: [],
      companyType: [],
    });

    // ✅ 채용공고 불러오기 함수
    function fetchJobs(pageNum, searchTerm, filters) {
      if (pageNum === 0) {
        setStatus('pending');
        setJobs([]);
      } else {
        setIsFetchingNextPage(true);
      }

        // ✅ 요청 body 정의
      const requestbody = {
      searchTerm: searchTerm || '', // 검색어
      filters: filters               // 필터 객체 그대로 전달
      };

      axios.post(`/api/search?page=${pageNum}&size=${PAGE_SIZE}`,requestbody)
        .then(function (res) {
          const data = res.data;
          const newJobs = data._embedded
            ? data._embedded.jobDtoList
            : (data.content || []);

          setJobs(function (prev) {
            // 기존 데이터 + 새 데이터 합치기
            const merged = pageNum === 0 ? newJobs : [...prev, ...newJobs];

            // ✅ 중복 제거 (id 기준)
            const unique = merged.filter(
              (job, index, self) =>
                index === self.findIndex(j => j.id === job.id)
            );

            return unique;
          });

          const isLast = data.page
            ? data.page.number >= data.page.totalPages - 1
            : false;
          setHasNextPage(!isLast);
          setStatus('success');
        })
        .catch(function (err) {
          setError(err);
          setStatus('error');
        })
        .finally(function () {
          setIsFetchingNextPage(false);
        });
    }

    // ✅ 첫 렌더 시 기본 목록 불러오기
    useEffect(function () {
      fetchJobs(0, appliedSearchTerm, appliedFilters);
    }, []);

  // ✅ 검색 및 필터 적용 함수
  function handleSearchAndFilter(term, filters, responseData) {
      setAppliedSearchTerm(term);
      setAppliedFilters(filters);
      setPage(0);

    // ✅ SearchFilterBar가 가져온 검색 결과(responseData)로만 화면을 설정합니다.
  if (responseData && responseData.content) {
    setJobs(responseData.content);
    setHasNextPage(responseData.last === false); // 백엔드 응답의 'last' 필드 사용
    setStatus('success');
    console.log("Search result set:", responseData.content);
    } else {
    // ✅ 검색 결과가 없는 경우, 빈 배열로 설정합니다.
    setJobs([]);
    setHasNextPage(false);
    setStatus('success');
    }
  }

    // ✅ 다음 페이지 불러오기
    function fetchNextPage() {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage, appliedSearchTerm, appliedFilters);
    }

    // ✅ 로딩 상태
    if (status === 'pending' && jobs.length === 0) {
      return (
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography>채용 정보를 불러오는 중...</Typography>
        </Container>
      );
    }

    // ✅ 에러 상태
    if (error) {
      return (
        <Container sx={{ py: 8 }}>
          <Alert severity="error">
            채용 정보를 가져오는 데 실패했습니다: {error.message}
          </Alert>
        </Container>
      );
    }

    // ✅ 메인 UI
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Just Pick.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            사람과 기업을 검색하세요
          </Typography>

          {/* 🔍 검색 + 필터 바 */}
          <SearchFilterBar onSearchAndFilter={handleSearchAndFilter} />
        </Box>

        {/* 📋 채용공고 목록 */}
        <Box sx={{ pb: 8 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            전체 채용공고
          </Typography>


          <Grid container spacing={3}>
            {jobs.map(function (job) {
              return (
                <Grid key={job.id || `${job.companyName}-${job.title}`} job={job} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ borderRadius: '16px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
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
                        <Bookmark jobId={job.id}/>
                        <Button
                          variant="outlined"
                          onClick={function () { setSelectedPost(job); }}
                        >
                          실시간 채팅
                        </Button>
                        <Button
                          variant="contained"
                          href={job.homepageUrl}
                          target="_blank"
                          disabled={!job.homepageUrl}
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

          {/* 더보기 버튼 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            {hasNextPage && (
              <Button onClick={fetchNextPage} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? <CircularProgress size={24} /> : '더보기'}
              </Button>
            )}
          </Box>
        </Box>

        {/* 채팅창 */}
        {selectedPost && (
          <ChatRoom post={selectedPost} onClose={function () { setSelectedPost(null); }} />
        )}
      </Container>
    );
  }

  export default MainPage;
