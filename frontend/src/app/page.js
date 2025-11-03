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
  // Avatar, // ⭐️ 1. Avatar 임포트 제거
  Button,
  Alert
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
// import axios from 'axios'; // ⭐️ api 모듈 사용
import ChatRoom from '@/components/ChatRoom';

import { api } from '@/api'; // 공용 api 인스턴스 사용

const PAGE_SIZE = 20; // 페이지 당 불러올 채용 공고 수

// 메인 페이지 컴포넌트
function MainPage() {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null); //chatroom을 위한 usesState 참일경우에만 보여줘야 함으로 null;

  // 채용 공고를 불러오는 함수 (⭐️ 원본 코드 로직 그대로 둠)
  function fetchJobs(pageNum) {
    setIsFetchingNextPage(true);
    
    api.get(`/api/work24/jobs?page=${pageNum}&size=${PAGE_SIZE}`)
      .then(response => {
        const data = response.data;
        
        setJobs(prevJobs => {
          const newJobs = data._embedded ? data._embedded.jobDtoList : [];
          const existingIds = new Set(prevJobs.map(j => j.id));
          const uniqueNewJobs = newJobs.filter(j => !existingIds.has(j.id)); // 중복 제거
          return [...prevJobs, ...uniqueNewJobs];
        });

        setHasNextPage(data.page && data.page.number < data.page.totalPages - 1); // 마지막 페이지인지 확인
        setStatus('success');
      })
      .catch(err => {
        setError(err);
        setStatus('error');
      })
      .finally(() => {
        setIsFetchingNextPage(false);
      });
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

  // ⭐️ 2. getLogoUrl 함수 제거 (Avatar를 안 쓰므로)
  // function getLogoUrl(url) { ... }

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
            
            // ⭐️ 3. 백엔드에서 받은 imgUrl로 public 경로 생성
            const bannerImageUrl = job.imgUrl ? `url(/${job.imgUrl})` : 'none';

            return (  
              // ⭐️ 4. Grid prop을 'size' (원본 코드)로 유지
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={job.id}>
                
                <Card sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  p: 0, // ⭐️ 5. Card 자체 padding을 0으로 변경
                  overflow: 'hidden'
                }}>

                  {/* ⭐️ 6. [추가] 스크랩한 배너 이미지 영역 ⭐️ */}
                  <Box sx={{
                    // ⭐️ 7. [수정] 배너 높이 180px로 변경 (이 값을 조절하세요)
                    height: '180px', 
                    width: '100%',
                    backgroundImage: bannerImageUrl,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: theme.palette.grey[200], // 이미지 없을 시 회색 배경
                  }} />

                  {/* ⭐️ 8. [추가] 컨텐츠 영역을 별도 Box로 감싸고 padding 적용 ⭐️ */}
                  <Box sx={{
                    p: { xs: 2, sm: 3 }, // 원본 Card의 padding을 여기로 이동
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between' // Card의 'justifyContent'를 여기로 이동
                  }}>

                    {/* 컨텐츠 (회사명, 타이틀, 칩) */}
                    <Box> 
                      {/* ⭐️ 9. [제거] Avatar 및 감싸던 Box 제거 */}
                      
                      {/* ⭐️ 10. [추가] 회사명 Typography (Avatar 대신) */}
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        noWrap 
                        sx={{ mb: 1.5, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {job.companyName}
                      </Typography>
                      
                      {/* ⭐️ 11. [수정] 타이틀 (2줄 말줄임표 적용 - CSS 오류 수정) ⭐️ */}
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        sx={{ 
                          height: '64px', // 2줄 높이 확보
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: '2', // CSS 오류 수정
                          WebkitBoxOrient: 'vertical', // CSS 오류 수정
                          whiteSpace: 'normal', // 'nowrap' 제거
                          mb: 2 // 칩과의 간격
                      }}>
                        {job.title}
                      </Typography>
                      
                      {/* 칩 (기존과 동일) */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {job.employmentType && <Chip label={job.employmentType} sx={{ backgroundColor: theme.palette.filters.employmentType, color: 'black', fontWeight: 'bold' }} />}
                        {job.location && <Chip label={job.location} sx={{ backgroundColor: theme.palette.filters.companyType, color: 'black', fontWeight: 'bold' }} />}
                        {job.startDate && job.endDate && <Chip icon={<FontAwesomeIcon icon={faCalendar} />} label={`${job.startDate} ~ ${job.endDate}`} />}
                      </Box>
                    </Box>

                    {/* 하단 버튼 (기존과 동일) */}
                    <CardActions sx={{ p: 0, mt: 2, alignSelf: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        onClick={function() { setSelectedPost(job); }}
                      >
                        실시간 채팅
                      </Button>
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
                    
                  </Box> {/* ⭐️ 8번에서 추가된 Box 닫기 */}

                </Card>
              </Grid>
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

      {selectedPost && (
        <ChatRoom
        post={selectedPost}
        onClose={function(){setSelectedPost(null)}}/>
      )}
    </Container>
  );
}

export default MainPage;