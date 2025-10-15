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
} from '@mui/material';

const EventsPage = () => {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 메인 페이지와 동일한 API 키를 사용합니다.
  // 실제 프로덕션에서는 환경변수 등으로 관리하는 것이 좋습니다.
  const apiKey = '	3e10252a-2cfe-4b5a-add7-49ac2f8d6cfa'; // 여기에 유효한 API 키를 입력하세요.

  useEffect(() => {
    const fetchEvents = async () => {
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        console.error("API 키를 입력해주세요.");
        setLoading(false);
        return;
      }

      const url = `/api/work24-events?authKey=${apiKey}`;

      try {
        const response = await fetch(url);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const eventNodes = xmlDoc.getElementsByTagName('empEvent');

        const eventData = Array.from(eventNodes).map(node => {
          const get = (tagName) => node.getElementsByTagName(tagName)[0]?.textContent || '';
          return {
            id: get('eventNo'),
            title: get('eventNm'),
            period: get('eventTerm'),
            location: get('area'),
          };
        });

        setEvents(eventData);
      } catch (error) {
        console.error("채용 행사 정보를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apiKey]);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        채용행사
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {events.map((event) => (
            <Card key={event.id} sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              minHeight: 120,
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              p: 3
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">{event.period}</Typography>
                <Typography variant="h6" fontWeight="bold">{event.title}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mt: 2 }}>
                <Chip label={event.location} />
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default EventsPage;