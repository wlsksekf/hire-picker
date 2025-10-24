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
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';

// 웹사이트의 헤더 컴포넌트
function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // 모바일 화면 여부 확인
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // 메인 메뉴 항목
  const mainNavItems = [
    { text: '채용행사', path: '/events' },
    { text: '공채기업정보', path: '/companies' },
    { text: '채용정보', path: '/postings' },
    { text: '취업축하금', path: '/rewards' },
    { text: '신입.인턴', path: '/intern' },
    { text: '기업.연봉', path: '/companies' },
    { text: '취업전략', path: '/strategy' },
    { text: '커뮤니티', path: '/community' },
  ];

  // 모바일 화면일 경우
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

  // 데스크탑 화면일 경우
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
      <Toolbar sx={{ minHeight: '72px' }}>
        {/* 로고 */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, mr: 4 }}>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box component="img" src="/claw.png" alt="HirePicker Logo" sx={{ width: 40, height: 40, marginRight: '8px' }} />
            <Typography variant="h6" component="span" fontWeight="bold">HirePicker</Typography>
          </Link>
        </Box>

        {/* 메인 메뉴 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mainNavItems.map(function(item) {
            return (
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
            )
          })}
        </Box>

        <Box sx={{ flexGrow: 1 }} /> {/* 오른쪽으로 밀어주는 빈 공간 */}

        {/* 로그인/회원가입 메뉴 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Button
                variant="text"
                onClick={handleLogout}
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
                로그아웃
              </Button>
              <Link href="/mypage" passHref style={{ textDecoration: 'none' }}>
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
                  마이페이지
                </Button>
              </Link>
              <Link href="/store" passHref style={{ textDecoration: 'none' }}>
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
                  크레딧 상점
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" passHref style={{ textDecoration: 'none' }}>
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
                  로그인
                </Button>
              </Link>
              <Link href="/signup" passHref style={{ textDecoration: 'none' }}>
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
                  회원가입
                </Button>
              </Link>
            </>
          )}
          <Link href="/settings" passHref style={{ textDecoration: 'none' }}>
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
              설정
            </Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
