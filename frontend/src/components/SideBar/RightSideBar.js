// 'use client';
import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, Box, Chip } from '@mui/material';

// 가상의 인기 공고 데이터
const hotJobs = [
  { id: 101, title: '[카카오] AI 엔지니어 모집', views: 999 },
  { id: 102, title: '[네이버] 프론트엔드 개발자', views: 870 },
  { id: 103, title: '[토스] 프로덕트 매니저(PM)', views: 750 },
];

const categories = ['개발', '기획', '마케팅', '디자인', '인사', '금융'];

function RightSidebar() {
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: '16px' }}>
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          실시간 인기 공고 🔥
        </Typography>
        <List dense>
          {hotJobs.map((job, index) => (
            <ListItem key={job.id} button>
              <ListItemText
                primary={`${index + 1}. ${job.title}`}
                secondary={`조회수 ${job.views}`}
                primaryTypographyProps={{ noWrap: true, fontWeight: 'bold' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      <Box mt={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          빠른 카테고리
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map((cat) => (
            <Chip key={cat} label={cat} onClick={() => alert(`${cat} 필터 클릭`)} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default RightSidebar;
