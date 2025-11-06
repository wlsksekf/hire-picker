// 고객센터 페이지는 사용자와의 상호작용(검색, 탭, 아코디언)이 많으므로 클라이언트 컴포넌트로 선언
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
              borderRadius: '12px', // 토스/당근 스타일의 부드러운 모서리
              padding: '4px 8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // 은은한 그림자
              backgroundColor: 'background.paper', // 배경색 추가
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent', // 테두리 색상 투명하게
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent', // 호버 시에도 테두리 색상 투명하게
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent', // 포커스 시에도 테두리 색상 투명하게
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 2. 핵심 메뉴 카드 그리드 */}
      <Grid container spacing={3} justifyContent="center"> {/* 간격 조정 */}
        {menuItems.map((item) => (
          <Grid item key={item.title} xs={12} sm={6} md={4}>
            <Link href={item.href} passHref style={{ textDecoration: 'none' }}>
              <CardActionArea component="div" sx={{ borderRadius: '12px' }}> {/* CardActionArea에도 borderRadius 적용 */}
                <Card
                  variant="outlined"
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    borderRadius: '12px', // 토스/당근 스타일의 부드러운 모서리
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // 은은한 그림자
                    borderColor: 'transparent', // 테두리 색상 투명하게
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // 호버 효과
                    '&:hover': {
                      transform: 'translateY(-4px)', // 살짝 떠오르는 효과
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)', // 그림자 강조
                    },
                  }}
                >
                  {React.cloneElement(item.icon, { sx: { ...item.icon.props.sx, fontSize: 48, color: 'primary.main' } })} {/* 아이콘 색상 및 크기 조정 */}
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: 'text.primary' }}> {/* 폰트 굵기 및 색상 조정 */}
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