'''// 고객센터 페이지는 사용자와의 상호작용(검색, 탭, 아코디언)이 많으므로 클라이언트 컴포넌트로 선언
'use client';

import React from 'react';
import { Container, Typography, Box, TextField, InputAdornment, Grid, Card, CardActionArea } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import Link from 'next/link';

// 하단 메뉴 아이템 데이터
const menuItems = [
  {
    icon: <QuestionAnswerOutlinedIcon sx={{ fontSize: 48 }} />,
    title: '자주 묻는 질문',
    href: '/support/faq', // FAQ 페이지는 나중에 만들어야 함
  },
  {
    icon: <CampaignOutlinedIcon sx={{ fontSize: 48 }} />,
    title: '공지사항',
    href: '/support/notices', // 공지사항 페이지도 나중에 만들어야 함
  },
  {
    icon: <CreateOutlinedIcon sx={{ fontSize: 48 }} />,
    title: '1:1 문의하기',
    href: '/support/inquiries/new',
  },
];

// '토스/당근' 스타일의 새로운 고객센터 메인 페이지
const SupportPage = () => {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
      {/* 1. Hero 검색 섹션 */}
      <Box sx={{ mb: 10 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontWeight: 'bold', mb: 3 }}
        >
          무엇이 궁금하신가요?
        </Typography>
        <TextField
          variant="outlined"
          placeholder="궁금한 점을 검색해보세요"
          sx={{
            width: '100%',
            maxWidth: '600px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px', // 타원형 검색창
              padding: '4px 8px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ ml: 1 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 2. 핵심 메뉴 카드 그리드 */}
      <Grid container spacing={4} justifyContent="center">
        {menuItems.map((item) => (
          <Grid item key={item.title} xs={12} sm={6} md={4}>
            <Link href={item.href} passHref style={{ textDecoration: 'none' }}>
              <CardActionArea component="div">
                <Card
                  variant="outlined"
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    // theme.js에 정의된 hover 스타일을 그대로 사용
                  }}
                >
                  {item.icon}
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                </Card>
              </CardActionArea>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SupportPage;
'''