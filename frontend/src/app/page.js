'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardActions,
  Box,
  Grid,
  useTheme,
  Chip,
  CircularProgress,
  Button,
  Alert,
  TextField,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Popover, 
  IconButton, 
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClose, faRedo } from '@fortawesome/free-solid-svg-icons'; 
import ChatRoom from '@/components/ChatRoom';
import { api } from '@/api';

const PAGE_SIZE = 18;

// 필터 옵션 상수
const JOB_TYPES = ['경영/기획', '개발', '디자인', '마케팅', '영업', '기타'];
const LOCATIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '경남', '경북', '전남', '전북', '충남', '충북'];
const EMPLOYMENT_TYPES = ['정규직', '정규직 전환형', '기간제', '인턴', '기타'];
const EDUCATION_LEVELS = ['학력무관', '고졸', '초대졸', '대졸', '석사 이상'];
const COMPANY_TYPES = ['대기업', '중견기업', '중소기업', '공기업', '기타'];


function MainPage() {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // 검색/필터 State
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filters, setFilters] = useState({
    jobType: [],
    location: [],
    employmentType: [],
    educationLevel: [],
    companyType: [],
  });
  
  const [appliedFilters, setAppliedFilters] = useState({
    jobType: [],
    location: [],
    employmentType: [],
    educationLevel: [],
    companyType: [],
  });
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  
  const [anchorEl, setAnchorEl] = useState(null); 
  const [currentFilterType, setCurrentFilterType] = useState(null);

  // 채용 공고 불러오는 함수
  function fetchJobs(pageNum, currentSearchTerm, currentFilters) {
    if (pageNum === 0) { 
        setStatus('pending');
        setJobs([]);
    } else {
        setIsFetchingNextPage(true);
    }
    
    const params = new URLSearchParams({
        page: pageNum,
        size: PAGE_SIZE,
    });
    
    if (currentSearchTerm) {
        params.append('companyName', currentSearchTerm);
    }
    currentFilters.jobType.forEach(v => params.append('jobType', v));
    currentFilters.location.forEach(v => params.append('location', v));
    currentFilters.employmentType.forEach(v => params.append('employmentType', v));
    currentFilters.educationLevel.forEach(v => params.append('educationLevel', v));
    currentFilters.companyType.forEach(v => params.append('companyType', v));

    api.get(`/api/work24/jobs?${params.toString()}`)
      .then(response => {
        // ... (API 응답 처리 로직은 동일) ...
        const data = response.data;
        const newJobs = data._embedded ? data._embedded.jobDtoList : (data.content || []);
        setJobs(prevJobs => {
            const baseJobs = pageNum === 0 ? [] : prevJobs;
            const existingIds = new Set(baseJobs.map(j => j.id));
            const uniqueNewJobs = newJobs.filter(j => !existingIds.has(j.id));
            return [...baseJobs, ...uniqueNewJobs];
        });
        let isLastPage = false;
        if (data.page) {
          isLastPage = data.page.number >= data.page.totalPages - 1;
        } else if (data.totalPages !== undefined) {
          isLastPage = data.number >= data.totalPages - 1;
        }
        setHasNextPage(!isLastPage); 
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

  // 컴포넌트 마운트 시
  useEffect(function() {
    fetchJobs(0, appliedSearchTerm, appliedFilters);
  }, []); 

  // "더보기" 버튼
  function fetchNextPage() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, appliedSearchTerm, appliedFilters);
  }

  // --- ⭐️ 검색/필터 이벤트 핸들러 ---
  
  const handleFilterChange = (category, value) => {
    setFilters(prevFilters => {
      const currentValues = prevFilters[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prevFilters, [category]: newValues };
    });
  };

  // 메인 검색창 (TextField) 검색 핸들러
  const handleSearch = () => {
    setPage(0); 
    setAppliedSearchTerm(searchTerm); 
    setAppliedFilters(filters); 
    fetchJobs(0, searchTerm, filters);
    handleClosePopover();
  };
  
  const handleOpenPopover = (event, filterType) => {
    setAnchorEl(event.currentTarget);
    setCurrentFilterType(filterType);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setCurrentFilterType(null);
  };
  
  const handleResetFilters = (filterType) => {
      setFilters(prev => ({
          ...prev,
          [filterType]: [] 
      }));
  };

  // 팝업 안의 "적용" 버튼
  const handleApplyFilters = () => {
      setPage(0); 
      setAppliedFilters(filters); 
      handleClosePopover(); 
      fetchJobs(0, appliedSearchTerm, filters); 
  };
  
  // "전체 초기화" 버튼
  const handleResetAll = () => {
      const emptyFilters = { jobType: [], location: [], employmentType: [], educationLevel: [], companyType: [] };
      setPage(0);
      setSearchTerm('');
      setFilters(emptyFilters);
      setAppliedSearchTerm('');
      setAppliedFilters(emptyFilters);
      fetchJobs(0, '', emptyFilters); 
      handleClosePopover();
  };
  
  const getFilterOptions = (filterType) => {
      switch(filterType) {
          case 'jobType': return JOB_TYPES;
          case 'location': return LOCATIONS;
          case 'employmentType': return EMPLOYMENT_TYPES;
          case 'educationLevel': return EDUCATION_LEVELS;
          case 'companyType': return COMPANY_TYPES;
          default: return [];
      }
  };
  // --- ------------------------- ---

  if (status === 'pending' && jobs.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>채용 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Alert severity="error">채용 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  const getFilterCount = (filterType) => filters[filterType].length;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2.5rem', sm: '3.75rem' } }}>
          Just Pick.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          사람과 기업을 검색하세요
        </Typography>

        {/* 메인 검색창 */}
        <Box sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="기업, 공고, 콘텐츠 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                  sx: { borderRadius: '50px', p: '8px 16px', fontSize: '1.1rem' },
                  endAdornment: (
                    <IconButton onClick={handleSearch}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 21L16.65 16.65" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </IconButton>
                  )
              }}
            />
        </Box>
      </Box>

      <Box sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          전체 채용공고
        </Typography>

        {/* 필터 버튼 영역 */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          
          <Button 
            variant={getFilterCount('jobType') > 0 ? "contained" : "outlined"} 
            onClick={(e) => handleOpenPopover(e, 'jobType')}
            sx={{ borderRadius: '8px' }}
          >
            직종 {getFilterCount('jobType') > 0 ? `(${getFilterCount('jobType')})` : ''}
          </Button>
          <Button 
            variant={getFilterCount('location') > 0 ? "contained" : "outlined"} 
            onClick={(e) => handleOpenPopover(e, 'location')}
            sx={{ borderRadius: '8px' }}
          >
            근무 지역 {getFilterCount('location') > 0 ? `(${getFilterCount('location')})` : ''}
          </Button>
          <Button 
            variant={getFilterCount('employmentType') > 0 ? "contained" : "outlined"} 
            onClick={(e) => handleOpenPopover(e, 'employmentType')}
            sx={{ borderRadius: '8px' }}
          >
            고용 형태 {getFilterCount('employmentType') > 0 ? `(${getFilterCount('employmentType')})` : ''}
          </Button>
           <Button 
            variant={getFilterCount('educationLevel') > 0 ? "contained" : "outlined"} 
            onClick={(e) => handleOpenPopover(e, 'educationLevel')}
            sx={{ borderRadius: '8px' }}
          >
            학력 {getFilterCount('educationLevel') > 0 ? `(${getFilterCount('educationLevel')})` : ''}
          </Button>
           <Button 
            variant={getFilterCount('companyType') > 0 ? "contained" : "outlined"} 
            onClick={(e) => handleOpenPopover(e, 'companyType')}
            sx={{ borderRadius: '8px' }}
          >
            기업 종류 {getFilterCount('companyType') > 0 ? `(${getFilterCount('companyType')})` : ''}
          </Button>

          <Box sx={{ flexGrow: 1 }} /> 

          <Button 
            startIcon={<FontAwesomeIcon icon={faRedo} size="sm" />}
            onClick={handleResetAll}
            sx={{ color: 'text.secondary' }}
          >
            초기화
          </Button>
        </Box>
        
        {/* ⭐️ 팝업 UI (Popover) ⭐️ */}
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClosePopover} 
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{ // ⭐️ 버튼 가림 현상 해결
                vertical: 'top',
                horizontal: 'left',
            }}
            PaperProps={{
                sx: { 
                  // ⭐️ [수정 1] 3열을 위해 너비 500px로 변경
                  width: '500px', 
                  maxHeight: '400px', 
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  p: 2, 
                  mt: 1 
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {currentFilterType === 'jobType' && '직종'}
                    {currentFilterType === 'location' && '근무 지역'}
                    {currentFilterType === 'employmentType' && '고용 형태'}
                    {currentFilterType === 'educationLevel' && '학력'}
                    {currentFilterType === 'companyType' && '기업 종류'}
                </Typography>
                <IconButton onClick={handleClosePopover} size="small">
                    <FontAwesomeIcon icon={faClose} />
                </IconButton>
            </Box>
            
            <FormGroup sx={{ 
                display: 'grid', 
                // ⭐️ [수정 2] 2열에서 3열로 변경 (긴 팝업 세로길이 축소)
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 0.5 
            }}>
                {currentFilterType && getFilterOptions(currentFilterType).map(option => (
                    <FormControlLabel
                        key={option}
                        control={
                            <Checkbox
                                checked={filters[currentFilterType].includes(option)}
                                onChange={() => handleFilterChange(currentFilterType, option)}
                                size="small"
                            />
                        }
                        label={option}
                        sx={{ m: 0 }}
                    />
                ))}
            </FormGroup>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => handleResetFilters(currentFilterType)}>초기화</Button>
                <Button variant="contained" onClick={handleApplyFilters}>적용</Button>
            </Box>
        </Popover>
        {/* ⭐️ --- 팝업 UI 영역 끝 --- ⭐️ */}

        <Grid container spacing={3} sx={{ width: '100%' }}>
          {status === 'pending' && jobs.length === 0 && (
             <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}><CircularProgress /></Box>
          )}
          {status === 'success' && jobs.length === 0 && (
             <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}><Typography>검색 결과가 없습니다.</Typography></Box>
          )}
          
          {jobs.map(function(job) {
            // ... (카드 렌더링 코드는 이전과 동일) ...
            const bannerImageUrl = job.imgUrl ? `url(/${job.imgUrl})` : 'none';
            return (
              // ⭐️ Grid 'size' prop 원본 유지
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={job.id}>
                <Card sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  p: 0, 
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    height: '180px', 
                    width: '100%',
                    backgroundImage: bannerImageUrl,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: theme.palette.grey[200],
                  }} />
                  <Box sx={{
                    p: { xs: 2, sm: 3 }, 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <Box> 
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        noWrap 
                        sx={{ mb: 1.5, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {job.companyName}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold" 
                        sx={{ 
                          height: '64px', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical',
                          whiteSpace: 'normal', 
                          mb: 2
                      }}>
                        {job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {job.employmentType && <Chip label={job.employmentType} sx={{ backgroundColor: theme.palette.filters.employmentType, color: 'black', fontWeight: 'bold' }} />}
                        {job.location && <Chip label={job.location} sx={{ backgroundColor: theme.palette.filters.companyType, color: 'black', fontWeight: 'bold' }} />}
                        {job.startDate && job.endDate && <Chip icon={<FontAwesomeIcon icon={faCalendar} />} label={`${job.startDate} ~ ${job.endDate}`} />}
                      </Box>
                    </Box>
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
                  </Box> 
                </Card>
              </Grid>
            )
          })}
        </Grid>
        
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