'use client';

import React, { useState, useMemo, useEffect } from 'react'; // useEffect 추가
import { createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components'; // styled-components의 ThemeProvider를 임포트합니다.
import CssBaseline from '@mui/material/CssBaseline';
import { filterColors } from '../theme/filterPalette';
import Header from './Header';
import Footer from './Footer';
import { Box, Container, CircularProgress } from '@mui/material'; // CircularProgress 임포트 추가
import { oklch2rgb } from 'colorizr';
import { ThemeModeContext } from '../theme/ThemeModeContext';
import useAuthStore from '@/store/authStore'; // useAuthStore 임포트 (추가됨)
import { usePathname } from 'next/navigation';

// oklch(l c h) 문자열을 rgb(r, g, b) 문자열로 변환하는 헬퍼 함수
function convertOklchToRgb(oklchStr) {
  if (!oklchStr || !oklchStr.includes('oklch')) return oklchStr;
  try {
    const values = oklchStr.replace('oklch(', '').replace(')', '').split(' ').map(Number);
    const [l, c, h] = values;
    const { r, g, b } = oklch2rgb([l, c, h]);
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    console.error('Color conversion failed:', e);
    return 'rgb(0,0,0)';
  }
}

// 테마 생성 로직
function getTheme(mode) {
  const oklchPalette = {
    mode,
    primary: {
      main: 'oklch(0.76 0.17 170)', // 선명한 민트 (Vivid Mint)
      light: 'oklch(0.86 0.17 170)', // 밝은 버전
      dark: 'oklch(0.66 0.17 170)',  // 어두운 버전
      contrastText: '#000000',
    },
    background: {
      default: mode === 'light' ? '#ffffff' : '#2d2d2d',
      paper: mode === 'light' ? '#ffffff' : '#2d2d2d',
    },
    text: {
      primary: mode === 'light' ? '#333D4B' : '#ffffff',
      secondary: mode === 'light' ? '#8B95A1' : '#ffffff',
    },
    filters: {},
  };

  for (const key in filterColors) {
    oklchPalette.filters[key] = mode === 'dark' ? filterColors[key].dark : filterColors[key].light;
  }

  const rgbPalette = JSON.parse(JSON.stringify(oklchPalette));

  rgbPalette.primary.main = convertOklchToRgb(rgbPalette.primary.main);
  rgbPalette.primary.light = convertOklchToRgb(rgbPalette.primary.light);
  rgbPalette.primary.dark = convertOklchToRgb(rgbPalette.primary.dark);

  for (const key in rgbPalette.filters) {
    rgbPalette.filters[key] = convertOklchToRgb(rgbPalette.filters[key]);
  }

  return createMuiTheme({
    palette: rgbPalette,
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            textTransform: 'none',
            '&:hover': {
              boxShadow: 'none',
            }
          }
        }
      }
    },
    typography: {
      fontFamily: 'Pretendard, sans-serif',
    },
  });
}

// 앱 전체에 테마와 레이아웃을 제공하는 컴포넌트
export default function AppProviders({ children }) {
  const [mode, setMode] = useState('light'); // 테마 모드 상태 (light/dark)
  const { initializeAuth, isLoading } = useAuthStore(); // isLoading 가져오기
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/hirepicker7338/admin');

  // 컴포넌트 마운트 시 인증 상태 초기화 (새로고침 시 항상 실행)
  useEffect(() => {
    console.log("AppProviders: useEffect triggered for auth initialization");
    console.log("AppProviders: window.location.href =", window.location.href);
    console.log("AppProviders: NEXT_PUBLIC_DISABLE_AUTH =", process.env.NEXT_PUBLIC_DISABLE_AUTH);
    
    // 환경 변수 확인 (문자열 'true'가 아닌 경우 인증 활성화)
    const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true' || 
                           process.env.NEXT_PUBLIC_DISABLE_AUTH === true;
    
    if (isAuthDisabled) {
      console.log("AppProviders: Auth disabled via env var, setting state to unauthenticated");
      useAuthStore.setState({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }
    
    // 새로고침 시 항상 인증 상태 확인
    const currentState = useAuthStore.getState();
    console.log("AppProviders: Current auth state:", { 
      isLoading: currentState.isLoading, 
      isAuthenticated: currentState.isAuthenticated,
      user: currentState.user ? 'present' : 'null'
    });
    
    // 초기화 실행 (항상 실행하여 새로고침 시 인증 상태 확인)
    console.log("AppProviders: Calling initializeAuth");
    const initPromise = initializeAuth();
    if (initPromise && typeof initPromise.then === 'function') {
      initPromise
        .then((userData) => {
          console.log("AppProviders: initializeAuth completed successfully", userData ? "with user data" : "without user data");
        })
        .catch((error) => {
          console.error("AppProviders: initializeAuth failed:", error);
        });
    } else {
      console.warn("AppProviders: initializeAuth did not return a promise");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 테마 모드가 변경될 때만 테마를 다시 생성
  const theme = useMemo(function() { return getTheme(mode) }, [mode]);

  return (
      <ThemeModeContext.Provider value={{ mode, setMode }}>
          <MuiThemeProvider theme={theme}>
            <StyledThemeProvider theme={theme}>
              <CssBaseline />
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                  <CircularProgress />
                </Box>
              ) : isAdminRoute ? (
                <Box sx={{ minHeight: '100vh' }}>
                  {children}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                  <Header />
                  <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
                    {children}
                  </Container>
                  <Footer />
                </Box>
              )}
            </StyledThemeProvider>
          </MuiThemeProvider>
      </ThemeModeContext.Provider>
  );
}
