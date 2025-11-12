// 'use client';
import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, Box } from '@mui/material';

// 가상의 최근 본 공고 데이터
const recentlyViewed = [
  { id: 1, title: '2025년 하반기 초대졸(G2) 신입' },
  { id: 2, title: 'FY2025 하반기 업무직원 공채' },
];

// 가상의 북마크 데이터 (실제로는 props나 context API로 받아와야 함)
const bookmarks = [
  { id: 3, title: '2025 경영지원 인턴사원 채용' },
];

function LeftSidebar() {
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: '16px' }}>
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          북마크한 공고
        </Typography>
        <List dense>
          {bookmarks.length > 0 ? (
            bookmarks.map((job) => (
              <ListItem key={job.id} button>
                <ListItemText primary={job.title} primaryTypographyProps={{ noWrap: true }} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText secondary="북마크한 공고가 없습니다." />
            </ListItem>
          )}
        </List>
      </Box>

      <Divider />

      <Box mt={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          최근 본 공고
        </Typography>
        <List dense>
          {recentlyViewed.map((job) => (
            <ListItem key={job.id} button>
              <ListItemText primary={job.title} primaryTypographyProps={{ noWrap: true }} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
}

export default LeftSidebar;
