'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Stack,
  useTheme,
  Chip,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import { faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { api } from '@/api'; // 공용 api 인스턴스 사용

const PAGE_SIZE = 20; // 페이지 당 불러올 채용 행사 수

// 채용 행사 페이지 컴포넌트
function EventsPage() {
  const theme = useTheme();
  const [events, setEvents] = useState([]); // 채용 행사 목록
  const [page, setPage] = useState(0); // 현재 페이지 번호
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [hasNextPage, setHasNextPage] = useState(true); // 다음 페이지 존재 여부

  // 컴포넌트가 마운트될 때 첫 페이지의 채용 행사를 불러옴
  useEffect(function() {
    setLoading(true);
    api.get(`/api/work24/events?page=0&size=${PAGE_SIZE}`)
      .then(function(response) {
        const data = response.data;
        const newEvents = data._embedded ? data._embedded.eventDtoList : [];
        setEvents(newEvents);
        setHasNextPage(data.page && data.page.number < data.page.totalPages - 1);
        setLoading(false);
      })
      .catch(function(err) {
        setError(err);
        setLoading(false);
      });
  }, []);

  // 다음 페이지의 채용 행사를 불러오는 함수
  function handleLoadMore() {
    const nextPage = page + 1;
    setLoading(true);
    
    api.get(`/api/work24/events?page=${nextPage}&size=${PAGE_SIZE}`)
      .then(function(response) {
        const data = response.data;
        const newEvents = data._embedded ? data._embedded.eventDtoList : [];
        setEvents(function(prevEvents) { return [...prevEvents, ...newEvents] });
        setHasNextPage(data.page && data.page.number < data.page.totalPages - 1);
        setPage(nextPage);
      })
      .catch(function(err) {
        setError(err);
      })
      .finally(function() {
        setLoading(false);
      });
  }

  // 초기 로딩 상태일 때
  if (loading && events.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>채용 행사 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러가 발생했을 때
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">채용 행사 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        채용행사
      </Typography>

      <Stack spacing={3}>
        {events.map(function(event) {
          return (
            <Card key={event.id} sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              p: 3
            }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">{event.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip 
                  icon={<FontAwesomeIcon icon={faCalendar} />} 
                  label={event.period} 
                  sx={{ backgroundColor: theme.palette.filters.jobField, color: 'black', fontWeight: 'bold' }}
                />
                <Chip 
                  icon={<FontAwesomeIcon icon={faMapMarkerAlt} />} 
                  label={event.location} 
                  sx={{ backgroundColor: theme.palette.filters.location, color: 'black', fontWeight: 'bold' }}
                />
              </Box>
            </Card>
          )
        })}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        {hasNextPage && (
          <Button
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '더보기'}
          </Button>
        )}
      </Box>

      {!hasNextPage && events.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
    </Container>
  );
}

export default EventsPage;
