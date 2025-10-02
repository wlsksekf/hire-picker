'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
  Collapse,
  Stack,
  Paper,
  useTheme,
} from '@mui/material';
import StyledSearchBar from '@/components/StyledSearchBar';
import AnimatedButton from '@/components/AnimatedButton';
import { Chip } from '@mui/material';
import SearchAnimation from '@/components/SearchAnimation';
import { filterCategories } from './filters'; // 필터 데이터 가져오기
import FilterSection from '@/components/FilterSection'; // FilterSection 컴포넌트 가져오기

// 샘플 데이터 (기존 유지)
const sampleJobs = [
    { id: 1, company: 'HirePicker Inc.', title: '시니어 프론트엔드 개발자', salary: '연봉 8,000만 원~', location: '서울 강남구', skills: ['React', 'Next.js', 'TypeScript'], experience: '10년 이상', education: '대졸' },
    { id: 2, company: 'TechNova', title: 'Java 백엔드 엔지니어', salary: '신입/경력 (협의)', location: '경기 성남시', skills: ['Java', 'Spring Boot', 'JPA'], experience: '신입', education: '초대졸' },
    { id: 3, company: 'AI 솔루션즈', title: '머신러닝 엔지니어', salary: '연봉 9,000만 원 이상', location: '원격/재택', skills: ['Python', 'TensorFlow', 'PyTorch'], experience: '4~6년', education: '석사' },
    { id: 4, company: '디자인시스템즈', title: 'UI/UX 디자이너', salary: '연봉 5,000만 원~', location: '서울 마포구', skills: ['Figma', 'Sketch', 'Adobe XD'], experience: '4~6년', education: '대졸' },
];

// 필터 초기 상태를 동적으로 생성
const initialFilterState = filterCategories.reduce((acc, category) => {
  acc[category.id] = [];
  return acc;
}, {});

const MainPage = () => {
  const theme = useTheme();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(initialFilterState);

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
    <Container maxWidth={false}>
      {/* 1. 검색 영역 */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Just Pick98765.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          사람과 기업을 검색하세요。
        </Typography>

        <SearchAnimation onFilterClick={handleFilterToggle} isFilterOpen={filterOpen} />

        <Collapse in={filterOpen}>
          <Paper sx={{ maxWidth: '700px', margin: 'auto', p: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
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
      {/* 2. 채용공고 그리드 */}
      <Box sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          전체 채용공고
        </Typography>
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {sampleJobs.map((job) => (
            <Grid
              key={job.id}
              size={{
                xs: 12,
                sm: 12
              }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" color="text.secondary">{job.company}</Typography>
                  <Typography variant="h5" fontWeight="bold">{job.title}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label={`경력: ${job.experience}`} sx={{ backgroundColor: theme.palette.filters.experienceLevel, color: 'white', fontWeight: 'bold' }} />
                    <Chip label={`학력: ${job.education}`} sx={{ backgroundColor: theme.palette.filters.educationLevel, color: 'white', fontWeight: 'bold' }} />
                    <Chip label={`지역: ${job.location}`} sx={{ backgroundColor: theme.palette.filters.location, color: 'white', fontWeight: 'bold' }} />
                    {job.skills.length > 0 && (
                      <Chip label={job.skills[0]} sx={{ backgroundColor: theme.palette.filters.jobField, color: 'white', fontWeight: 'bold' }} />
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <AnimatedButton fullWidth size="large" variant="contained">
                    지원하기
                  </AnimatedButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default MainPage;