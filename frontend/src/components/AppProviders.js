'use client';

import React, { useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { filterColors } from '../theme/filterPalette';
import Header from './Header';
import Footer from './Footer';
import { Box, Container } from '@mui/material';
import { oklch2rgb } from 'colorizr';

// oklch(l c h) 문자열을 rgb(r, g, b) 문자열로 변환하는 헬퍼 함수
const convertOklchToRgb = (oklchStr) => {
  if (!oklchStr || !oklchStr.includes('oklch')) return oklchStr; // oklch가 아니면 그대로 반환
  try {
    const values = oklchStr.replace('oklch(', '').replace(')', '').split(' ').map(Number);
    const [l, c, h] = values;
    const { r, g, b } = oklch2rgb([l, c, h]);
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    console.error('Color conversion failed:', e);
    return 'rgb(0,0,0)'; // 변환 실패 시 검은색 반환
  }
};

// 테마 생성 로직
const getTheme = (mode) => {
  // 1. 원본 oklch 팔레트 정의
  const oklchPalette = {
    mode,
    primary: {
      main: 'oklch(0.70 0.30 165)',
      light: 'oklch(0.80 0.30 165)',
      dark: 'oklch(0.60 0.30 165)',
      contrastText: '#000000',
    },
    filters: { ...filterColors },
    ...(mode === 'dark' && {
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: 'rgba(255, 255, 255, 0.87)',
        secondary: 'rgba(255, 255, 255, 0.6)',
      },
      filters: {
        employmentType: 'oklch(0.80 0.25 30)',
        jobField: 'oklch(0.80 0.25 90)',
        experienceLevel: 'oklch(0.75 0.25 200)',
        educationLevel: 'oklch(0.75 0.25 250)',
        location: 'oklch(0.70 0.25 280)',
        salary: 'oklch(0.80 0.25 320)',
        companyType: 'oklch(0.80 0.25 0)',
        workingHours: 'oklch(0.75 0.20 45)',
        benefits: 'oklch(0.75 0.20 180)',
        otherFeatures: 'oklch(0.75 0.20 270)',
        workIntensity: 'oklch(0.75 0.25 310)',
      },
    }),
  };

  // 2. oklch 값을 rgb 값으로 변환한 새로운 팔레트 생성
  const rgbPalette = JSON.parse(JSON.stringify(oklchPalette)); // Deep copy

  rgbPalette.primary.main = convertOklchToRgb(oklchPalette.primary.main);
  rgbPalette.primary.light = convertOklchToRgb(oklchPalette.primary.light);
  rgbPalette.primary.dark = convertOklchToRgb(oklchPalette.primary.dark);

  for (const key in rgbPalette.filters) {
    rgbPalette.filters[key] = convertOklchToRgb(oklchPalette.filters[key]);
  }
  if (mode === 'dark') {
    for (const key in rgbPalette.filters) {
      rgbPalette.dark.filters[key] = convertOklchToRgb(oklchPalette.dark.filters[key]);
    }
  }

  // 3. 최종적으로 변환된 rgb 팔레트를 사용하여 테마 생성
  return createTheme({ 
    palette: rgbPalette,
    typography: {
      fontFamily: 'Pretendard, sans-serif',
    },
  });
};

export default function AppProviders({ children }) {
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header mode={mode} setMode={setMode} />
        <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
          {children}
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}