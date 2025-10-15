'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import Link from 'next/link';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 메인 메뉴
  const mainNavItems = [
    { text: '채용정보', path: '/postings' },
    { text: '취업축하금', path: '/rewards' },
    { text: '신입.인턴', path: '/intern' },
    { text: '기업.연봉', path: '/companies' },
    { text: '취업전략', path: '/strategy' },
    { text: '커뮤니티', path: '/community' },
  ];

  // 로그인 관련 메뉴
  const authNavItems = [
    { text: '로그인', path: '/login' },
    { text: '회원가입', path: '/signup' },
    { text: '설정', path: '/settings' },
  ];

  // 모바일에서는 기존의 심플한 헤더 유지
  if (isMobile) {
    return (
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <Toolbar>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box component="img" src="/claw.png" alt="HirePicker Logo" sx={{ width: 32, height: 32, marginRight: '8px' }} />
            <Typography variant="h6" component="span" fontWeight="bold">HirePicker</Typography>
          </Link>
        </Toolbar>
      </AppBar>
    );
  }

  // 데스크탑용 새로운 한 줄 헤더
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Toolbar sx={{ minHeight: '72px' }}> {/* 헤더 높이 증가 */}
        {/* 로고 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, mr: 4 }}>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/claw.png" alt="HirePicker Logo" sx={{ width: 40, height: 40, marginRight: '8px' }} />
            <Typography variant="h6" component="span" fontWeight="bold">HirePicker</Typography>
          </Link>
        </Box>

        {/* 메인 메뉴 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mainNavItems.map((item) => (
            <Link key={item.text} href={item.path} passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="text"
                sx={{
                  color: 'text.primary',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} /> {/* 오른쪽으로 밀어주는 빈 공간 */}

        {/* 로그인/회원가입 메뉴 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {authNavItems.map((item) => (
            <Link key={item.text} href={item.path} passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="text"
                sx={{
                  color: 'text.primary',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;