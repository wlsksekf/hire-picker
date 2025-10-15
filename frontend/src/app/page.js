'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardActions,
  Box,
  Collapse,
  Stack,
  Paper,
  useTheme,
  Chip,
  CircularProgress,
} from '@mui/material';
import AnimatedButton from '@/components/AnimatedButton';
import SearchAnimation from '@/components/SearchAnimation';
import { filterCategories } from './filters'; // 필터 데이터 가져오기
import FilterSection from '@/components/FilterSection'; // FilterSection 컴포넌트 가져오기

// 필터 초기 상태 동적 생성
const initialFilterState = filterCategories.reduce((acc, category) => {
  acc[category.id] = [];
  return acc;
}, {});

const MainPage = () => {
  const theme = useTheme();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(initialFilterState);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // =================================================================
  // =================== 여기에 API 키를 입력하세요 =====================
  // =================================================================
  const apiKey = '3e10252a-2cfe-4b5a-add7-49ac2f8d6cfa';
  // =================================================================
  // =================================================================
  // =================================================================

  useEffect(() => {
    const fetchJobs = async () => {
      if (apiKey === 'YOUR_API_KEY' || !apiKey) {
        console.error("API 키를 입력해주세요.");
        setLoading(false);
        return;
      }

      const url = `/api/work24-jobs?authKey=${apiKey}`;

      try {
        const response = await fetch(url);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const wantedNodes = xmlDoc.getElementsByTagName('dhsOpenEmpInfo');

        const jobData = Array.from(wantedNodes).map(node => {
          const get = (tagName) => node.getElementsByTagName(tagName)[0]?.textContent || '';
          return {
            id: get('empSeqno'),
            company: get('empBusiNm'),
            title: get('empWantedTitle'),
            salary: '', // 공채속보 API에는 급여 정보가 없습니다.
            location: get('coClcdNm'), // 근무지 대신 기업구분명을 사용합니다.
            skills: [], 
            experience: get('empWantedTypeNm'), // 경력 대신 고용형태(정규직 등)를 사용합니다.
            education: '', // 공채속보 API에는 학력 정보가 없습니다.
          };
        });

        setJobs(jobData);
      } catch (error) {
        console.error("채용 정보를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [apiKey]);

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterChange = (categoryId, value) => {
    setSelectedFilters(prev => {
      const currentCategoryFilters = prev[categoryId];
      const newCategoryFilters = currentCategoryFilters.includes(value)
        ? currentCategoryFilters.filter(item => item !== value)
        : [...currentCategoryFilters, value];
      return { ...prev, [categoryId]: newCategoryFilters };
    });
  };

  return (
    <Container maxWidth="lg">
      {/* 1. 검색 영역 */}
      <Box sx={{ 
        py: 12,
        textAlign: 'center'
      }}>
        <Box sx={{ zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2.5rem', sm: '3.75rem' } }}>
            Just Pick.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            사람과 기업을 검색하세요
          </Typography>

          <SearchAnimation onFilterClick={handleFilterToggle} isFilterOpen={filterOpen} />

          <Collapse in={filterOpen}>
            <Paper sx={{ maxWidth: '700px', margin: 'auto', p: 3 }}>
              <Stack spacing={3}>
                {filterCategories.map(category => (
                  <FilterSection
                    key={category.id}
                    title={category.label}
                    options={category.options}
                    selectedOptions={selectedFilters[category.id]}
                    onFilterChange={(value) => handleFilterChange(category.id, value)}
                    color={theme.palette.filters[category.id]}
                  />
                ))}
              </Stack>
            </Paper>
          </Collapse>
        </Box>
      </Box>

      {/* 2. 채용공고 그리드 */}
      <Box sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          전체 채용공고
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {jobs.map((job) => (
              <Card key={job.id} sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                width: '100%', 
                minHeight: { xs: 150, sm: 180 },
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                p: { xs: 1.5, sm: 2, md: 3 }
              }}>
                {/* Top Section: Company and Title */}
                <Box>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>{job.company}</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>{job.title}</Typography>
                </Box>

                {/* Bottom Section: Chips and Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: { xs: 1.5, sm: 2 } }}>
                  {/* Chips on the left */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}>
                    <Chip label={`경력: ${job.experience || '무관'}`} sx={{ backgroundColor: theme.palette.filters.experienceLevel, color: 'black', fontWeight: 'bold' }} />
                    <Chip label={`학력: ${job.education || '무관'}`} sx={{ backgroundColor: theme.palette.filters.educationLevel, color: 'black', fontWeight: 'bold' }} />
                    <Chip label={`지역: ${job.location || '전국'}`} sx={{ backgroundColor: theme.palette.filters.location, color: 'black', fontWeight: 'bold' }} />
                    {job.salary && (
                      <Chip label={job.salary} sx={{ backgroundColor: theme.palette.filters.jobField, color: 'black', fontWeight: 'bold' }} />
                    )}
                  </Box>
                  
                  {/* Button on the right */}
                  <CardActions sx={{ p: 0 }}>
                    <AnimatedButton variant="contained" sx={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                      지원하기
                    </AnimatedButton>
                  </CardActions>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default MainPage;
