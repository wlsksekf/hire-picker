'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Stack,
  CircularProgress,
  CardActions,
  Button,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import { faLink, faIdBadge } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PAGE_SIZE = 20;
const MAX_ITEMS = 100;

const CompaniesPage = () => {
  const theme = useTheme();
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchCompanies = useCallback(async () => {
    if (loading || !hasMore || companies.length >= MAX_ITEMS) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/worknet/companies?page=${page}&size=${PAGE_SIZE}`);
      if (!response.ok) throw new Error('Failed to fetch companies');
      const data = await response.json();

      setCompanies(prevCompanies => {
        const existingIds = new Set(prevCompanies.map(c => c.id));
        const newCompanies = data.content.filter(c => !existingIds.has(c.id));
        return [...prevCompanies, ...newCompanies];
      });

      setPage(prevPage => prevPage + 1);
      setHasMore(!data.last && (companies.length + data.content.length < MAX_ITEMS));
    } catch (error) {
      console.error("공채 기업 정보를 가져오는 데 실패했습니다.", error.message);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, companies.length]);

  useEffect(() => {
    fetchCompanies(); // Initial fetch
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lastCompanyElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchCompanies();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchCompanies]);

  const getLogoUrl = (url) => {
    if (!url) return null;
    return `https://www.work.go.kr/images/recruit/${url}`;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        공채 기업 정보
      </Typography>

      <Stack spacing={3}>
        {companies.map((company, index) => {
          const cardContent = (
            <Card key={company.id || index} sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              p: 3
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                        src={getLogoUrl(company.logoUrl)}
                        alt={`${company.name} logo`}
                        sx={{ width: 40, height: 40, mr: 2, border: `1px solid ${theme.palette.divider}` }}
                    >
                        {company.name ? company.name.charAt(0) : 'C'}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{company.name}</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {company.summary}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                {company.businessNumber && <Chip 
                  icon={<FontAwesomeIcon icon={faIdBadge} />} 
                  label={`사업자번호: ${company.businessNumber}`}
                  variant="outlined"
                />}
                <CardActions sx={{ p: 0 }}>
                  {company.homepage && (
                    <Button 
                      variant="contained"
                      href={company.homepage.startsWith('http') ? company.homepage : `http://${company.homepage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<FontAwesomeIcon icon={faLink} />}
                    >
                      홈페이지
                    </Button>
                  )}
                </CardActions>
              </Box>
            </Card>
          );
          if (companies.length === index + 1) {
            return <div key={company.id || index} ref={lastCompanyElementRef}>{cardContent}</div>;
          }
          return cardContent;
        })}
      </Stack>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
      {!hasMore && companies.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
    </Container>
  );
};

export default CompaniesPage;
