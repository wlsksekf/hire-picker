'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Stack,
  useTheme,
  Chip,
  CircularProgress
} from '@mui/material';
import { faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PAGE_SIZE = 20;
const MAX_ITEMS = 100;

const EventsPage = () => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchEvents = useCallback(async () => {
    if (loading || !hasMore || events.length >= MAX_ITEMS) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/work24/events?page=${page}&size=${PAGE_SIZE}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();

      setEvents(prevEvents => {
        const existingIds = new Set(prevEvents.map(e => e.id));
        const newEvents = data.content.filter(e => !existingIds.has(e.id));
        return [...prevEvents, ...newEvents];
      });

      setPage(prevPage => prevPage + 1);
      setHasMore(!data.last && (events.length + data.content.length < MAX_ITEMS));
    } catch (error) {
      console.error("채용 행사 정보를 가져오는 데 실패했습니다.", error.message);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, events.length]);

  useEffect(() => {
    fetchEvents(); // Initial fetch
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lastEventElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchEvents();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchEvents]);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        채용행사
      </Typography>

      <Stack spacing={3}>
        {events.map((event, index) => {
          const cardContent = (
            <Card key={event.id || index} sx={{
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
          );
          if (events.length === index + 1) {
            return <div key={event.id || index} ref={lastEventElementRef}>{cardContent}</div>;
          }
          return cardContent;
        })}
      </Stack>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
      {!hasMore && events.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
    </Container>
  );
};

export default EventsPage;