'use client';

import React from 'react';
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
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

const PAGE_SIZE = 20;

// React Query를 위한 데이터 호출 함수 (axios 사용)
async function fetchEvents({ pageParam = 0 }) {
  const response = await axios.get(`/api/work24/events?page=${pageParam}&size=${PAGE_SIZE}`);
  return response.data;
}

function EventsPage() {
  const theme = useTheme();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    initialPageParam: 0,
    getNextPageParam: function(lastPage, allPages) {
      return lastPage && !lastPage.last ? allPages.length : undefined;
    },
  });

  // 초기 로딩 상태
  if (status === 'pending') {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>채용 행사 정보를 불러오는 중...</Typography>
      </Container>
    );
  }

  // 에러 상태
  if (status === 'error') {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">채용 행사 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      </Container>
    );
  }

  const events = data.pages.flatMap(function(page) { return page.content });

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
            onClick={function() { return fetchNextPage() }}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <CircularProgress size={24} /> : '더보기'}
          </Button>
        )}
      </Box>

      {!hasNextPage && events.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
    </Container>
  );
}

export default EventsPage;