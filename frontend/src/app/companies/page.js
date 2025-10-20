'use client';

import React, { useState, useEffect } from 'react';
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
  useTheme,
  Alert,
  TextField
} from '@mui/material';
import { faLink, faIdBadge } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Link from 'next/link';

const PAGE_SIZE = 20;

function CompaniesPage() {
  const theme = useTheme();
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');

  useEffect(function() {
    setLoading(true);
    const apiUrl = `/api/work24/companies?page=0&size=${PAGE_SIZE}${query ? `&query=${query}` : ''}`;
    
    axios.get(apiUrl)
      .then(function(response) {
        const data = response.data;
        setCompanies(data.content);
        setHasNextPage(!data.last);
        setPage(0);
        setError(null);
      })
      .catch(function(err) {
        setError(err);
        setCompanies([]);
      })
      .finally(function() {
        setLoading(false);
      });
  }, [query]);

  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setQuery(searchTerm);
  };

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const apiUrl = `/api/work24/companies?page=${nextPage}&size=${PAGE_SIZE}${query ? `&query=${query}` : ''}`;
      const response = await axios.get(apiUrl);
      const data = response.data;
      setCompanies(function(prevCompanies) { return [...prevCompanies, ...data.content] });
      setHasNextPage(!data.last);
      setPage(nextPage);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function getLogoUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) {
        return url;
    }
    return `https://www.work.go.kr/images/recruit/${url}`;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        공채 기업 정보
      </Typography>

      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="원하시는 기업명을 입력해주세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ whiteSpace: 'nowrap' }}>
          검색
        </Button>
      </Box>

      {loading && companies.length === 0 && (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography>기업 정보를 불러오는 중...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error">공채 기업 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      )}

      {!loading && companies.length === 0 && (
          <Alert severity="info">검색 결과가 없습니다.</Alert>
      )}

      <Stack spacing={3}>
        {companies.map(function(company, index) {
          return (
            <Link href={`/companies/${company.id}`} key={company.id || index} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                p: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }
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
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = company.homepage.startsWith('http') ? company.homepage : `http://${company.homepage}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        startIcon={<FontAwesomeIcon icon={faLink} />}
                      >
                        홈페이지
                      </Button>
                    )}
                  </CardActions>
                </Box>
              </Card>
            </Link>
          );
        })}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        {hasNextPage && (
          <Button
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading && companies.length > 0 ? <CircularProgress size={24} /> : '더보기'}
          </Button>
        )}
      </Box>

      {!hasNextPage && companies.length > 0 && <Typography textAlign="center" sx={{ mt: 4, color: 'text.secondary' }}>모든 정보를 불러왔습니다.</Typography>}
    </Container>
  );
}

export default CompaniesPage;