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
  Chip,
  Collapse,
  Stack,
  Paper,
} from '@mui/material';
import StyledSearchBar from '@/components/StyledSearchBar';
import AnimatedButton from '@/components/AnimatedButton';
import StyledFilterChip from '@/components/StyledFilterChip';
import SearchAnimation from '@/components/SearchAnimation';

// --- 필터 데이터 및 색상 정의 ---
const EXP_COLOR = '#004080';    // 경력 (oklch 변환 네이비)
const EDU_COLOR = '#70B8D8';    // 학력 (oklch 변환 스카이 블루)
const TECH_COLOR = '#009688';   // 기술 (oklch 변환 틸)
const SALARY_COLOR = '#005691'; // 연봉 (oklch 변환 미드나잇 블루)

const experienceOptions = ['신입', '1~3년', '4~6년', '7~9년', '10년 이상'];
const educationOptions = ['고졸 이하', '초대졸', '대졸', '석사', '박사'];
const techOptions = ['React', 'Next.js', 'TypeScript', 'Java', 'Spring', 'Python', 'AWS', 'Kubernetes'];
const salaryOptions = ['~3000만', '3000만~5000만', '5000만~7000만', '7000만 이상'];

// 샘플 데이터
const sampleJobs = [
    { id: 1, company: 'HirePicker Inc.', title: '시니어 프론트엔드 개발자', salary: '연봉 8,000만 원~', location: '서울 강남구', skills: ['React', 'Next.js', 'TypeScript'], experience: '10년 이상', education: '대졸' },
    { id: 2, company: 'TechNova', title: 'Java 백엔드 엔지니어', salary: '신입/경력 (협의)', location: '경기 성남시', skills: ['Java', 'Spring Boot', 'JPA'], experience: '신입', education: '초대졸' },
    { id: 3, company: 'AI 솔루션즈', title: '머신러닝 엔지니어', salary: '연봉 9,000만 원 이상', location: '원격/재택', skills: ['Python', 'TensorFlow', 'PyTorch'], experience: '4~6년', education: '석사' },
    { id: 4, company: '디자인시스템즈', title: 'UI/UX 디자이너', salary: '연봉 5,000만 원~', location: '서울 마포구', skills: ['Figma', 'Sketch', 'Adobe XD'], experience: '4~6년', education: '대졸' },
];

const MainPage = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    experience: [], // 선택된 경력 (다중 선택 가능)
    education: [],  // 선택된 학력 (다중 선택 가능)
    techStack: [],  // 선택된 기술 스택 (다중 선택 가능)
    salary: [],     // 선택된 연봉 (다중 선택 가능)
  });

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => {
      const currentCategoryFilters = prev[category];
      const newCategoryFilters = currentCategoryFilters.includes(value)
        ? currentCategoryFilters.filter(item => item !== value)
        : [...currentCategoryFilters, value];
      return { ...prev, [category]: newCategoryFilters };
    });
  };

  return (
    <Container maxWidth="lg">
      {/* 1. 검색 영역 */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Just Pick555555.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          사람과 기업을 검색하세요。
        </Typography>

        <SearchAnimation onFilterClick={handleFilterToggle} isFilterOpen={filterOpen} />

        <Collapse in={filterOpen} sx={{ mt: 2 }}>
          <Paper sx={{ maxWidth: '700px', margin: 'auto', p: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Stack spacing={2}>
              {/* 경력 필터 */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>경력</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {experienceOptions.map(option => (
                    <Chip
                      key={option}
                      label={option}
                      variant={selectedFilters.experience.includes(option) ? 'filled' : 'outlined'}
                      onClick={() => handleFilterChange('experience', option)}
                      sx={{
                        fontWeight: 'bold',
                        ...(selectedFilters.experience.includes(option) && {
                          backgroundColor: EXP_COLOR,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: EXP_COLOR,
                          }
                        }),
                        ...(!selectedFilters.experience.includes(option) && {
                          color: EXP_COLOR,
                          borderColor: EXP_COLOR,
                        })
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 학력 필터 */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>학력</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {educationOptions.map(option => (
                    <Chip
                      key={option}
                      label={option}
                      variant={selectedFilters.education.includes(option) ? 'filled' : 'outlined'}
                      onClick={() => handleFilterChange('education', option)}
                      sx={{
                        fontWeight: 'bold',
                        ...(selectedFilters.education.includes(option) && {
                          backgroundColor: EDU_COLOR,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: EDU_COLOR,
                          }
                        }),
                        ...(!selectedFilters.education.includes(option) && {
                          color: EDU_COLOR,
                          borderColor: EDU_COLOR,
                        })
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 기술 필터 */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>기술</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {techOptions.map(option => (
                    <Chip
                      key={option}
                      label={option}
                      variant={selectedFilters.techStack.includes(option) ? 'filled' : 'outlined'}
                      onClick={() => handleFilterChange('techStack', option)}
                      sx={{
                        fontWeight: 'bold',
                        ...(selectedFilters.techStack.includes(option) && {
                          backgroundColor: TECH_COLOR,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: TECH_COLOR,
                          }
                        }),
                        ...(!selectedFilters.techStack.includes(option) && {
                          color: TECH_COLOR,
                          borderColor: TECH_COLOR,
                        })
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* 연봉 필터 */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>연봉</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {salaryOptions.map(option => (
                    <Chip
                      key={option}
                      label={option}
                      variant={selectedFilters.salary.includes(option) ? 'filled' : 'outlined'}
                      onClick={() => handleFilterChange('salary', option)}
                      sx={{
                        fontWeight: 'bold',
                        ...(selectedFilters.salary.includes(option) && {
                          backgroundColor: SALARY_COLOR,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: SALARY_COLOR,
                          }
                        }),
                        ...(!selectedFilters.salary.includes(option) && {
                          color: SALARY_COLOR,
                          borderColor: SALARY_COLOR,
                        })
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Collapse>
      </Box>

      {/* 2. 채용공고 그리드 */}
      <Box sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          전체 채용공고
        </Typography>
        <Grid container spacing={3}>
          {sampleJobs.map((job) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }} key={job.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" color="text.secondary">{job.company}</Typography>
                  <Typography variant="h5" fontWeight="bold">{job.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{job.location}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <StyledFilterChip key={`education-${job.id}`} label={`학력: ${job.education}`} chipColor={EDU_COLOR} />
                    <StyledFilterChip key={`experience-${job.id}`} label={`경력: ${job.experience}`} chipColor={EXP_COLOR} />
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.skills.map(skill => (
                      <StyledFilterChip key={`skill-${job.id}-${skill}`} label={skill} chipColor={TECH_COLOR} />
                    ))}
                    <StyledFilterChip key={`salary-${job.id}`} label={job.salary} chipColor={SALARY_COLOR} />
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