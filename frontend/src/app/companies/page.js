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
import { api } from '@/api'; // 공용 api 인스턴스 사용
import Link from 'next/link';

const PAGE_SIZE = 20; // 페이지 당 불러올 기업 수

// 기업 목록 페이지 컴포넌트
function CompaniesPage() {
  const theme = useTheme();
  const [companies, setCompanies] = useState([]); // 기업 목록
  const [page, setPage] = useState(0); // 현재 페이지 번호
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [hasNextPage, setHasNextPage] = useState(true); // 다음 페이지 존재 여부

  const [searchTerm, setSearchTerm] = useState(''); // 검색어 입력 값
  const [query, setQuery] = useState(''); // 실제 검색에 사용될 쿼리

  // 컴포넌트가 마운트되거나 쿼리가 변경될 때 기업 정보를 불러옴
  useEffect(function() {
    setLoading(true);
    const apiUrl = `/api/work24/companies?page=0&size=${PAGE_SIZE}${query ? `&query=${query}` : ''}`;
    
    api.get(apiUrl)
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

  // 검색 제출 핸들러
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setQuery(searchTerm);
  };

  // 다음 페이지의 기업 정보를 불러오는 함수
  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const apiUrl = `/api/work24/companies?page=${nextPage}&size=${PAGE_SIZE}${query ? `&query=${query}` : ''}`;
      const response = await api.get(apiUrl);
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

  // 로고 URL을 반환하는 함수
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

      {loading && companies.length === 0 && ( // 초기 로딩 상태
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography>기업 정보를 불러오는 중...</Typography>
        </Box>
      )}

      {error && ( // 에러 상태
        <Alert severity="error">공채 기업 정보를 가져오는 데 실패했습니다: {error.message}</Alert>
      )}

      {!loading && companies.length === 0 && ( // 검색 결과가 없을 때
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
