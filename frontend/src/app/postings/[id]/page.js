'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
} from '@mui/material';

function JobPostingDetail({ params }) {
  // params.id를 사용하여 실제 데이터를 가져올 수 있습니다.
  const { id } = params;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          시니어 프론트엔드 개발자 (React)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            (주)하이어피커
          </Typography>
          <Chip label="서울 강남구" sx={{ ml: 2 }} />
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            주요업무
          </Typography>
          <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            - HirePicker 서비스 프론트엔드 개발
            - 신규 기능 설계 및 구현
            - 코드 품질 개선 및 유지보수
          </Typography>
        </Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            자격요건
          </Typography>
          <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            - 프론트엔드 개발 경력 5년 이상
            - React, Redux, Next.js 등 사용 경험
            - MUI, Styled-components 등 CSS-in-JS 경험
          </Typography>
        </Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            기술스택
          </Typography>
          <Box>
            <Chip label="React" sx={{ mr: 1, mb: 1, borderRadius: '8px' }} />
            <Chip label="Next.js" sx={{ mr: 1, mb: 1, borderRadius: '8px' }} />
            <Chip label="TypeScript" sx={{ mr: 1, mb: 1, borderRadius: '8px' }} />
            <Chip label="MUI" sx={{ mr: 1, mb: 1, borderRadius: '8px' }} />
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Button variant="contained" color="primary" size="large">
            지원하기
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default JobPostingDetail;