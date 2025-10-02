'use client';

import React, { useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { filterColors } from '../theme/filterPalette';
import Header from './Header';
import Footer from './Footer';
import { Box, Container } from '@mui/material';

// 테마 생성 로직
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: 'rgb(0, 220, 163)',      // oklch(0.70 0.30 165)
      light: 'rgb(153, 255, 229)',   // oklch(0.80 0.30 165)
      dark: 'rgb(0, 184, 137)',      // oklch(0.60 0.30 165)
      contrastText: '#000000',
    },
    filters: filterColors, // light 모드 필터 색상
    ...(mode === 'dark' && {
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: 'rgba(255, 255, 255, 0.87)',
        secondary: 'rgba(255, 255, 255, 0.6)',
      },
      filters: { // dark 모드 필터 색상
        employmentType: 'rgb(255, 180, 149)',    // oklch(0.80 0.25 30)
        jobField: 'rgb(255, 235, 102)',    // oklch(0.80 0.25 90)
        experienceLevel: 'rgb(128, 207, 223)',   // oklch(0.75 0.25 200)
        educationLevel: 'rgb(153, 194, 255)',   // oklch(0.75 0.25 250)
        location: 'rgb(156, 183, 255)',      // oklch(0.70 0.25 280)
        salary: 'rgb(255, 179, 247)',        // oklch(0.80 0.25 320)
        companyType: 'rgb(255, 179, 179)',      // oklch(0.80 0.25 0)
        workingHours: 'rgb(255, 204, 134)',    // oklch(0.75 0.20 45)
        benefits: 'rgb(137, 212, 199)',      // oklch(0.75 0.20 180)
        otherFeatures: 'rgb(188, 188, 255)',    // oklch(0.75 0.20 270)
        workIntensity: 'rgb(255, 168, 255)',    // oklch(0.75 0.25 310)
      },
    }),
  },
  typography: {
    fontFamily: 'Pretendard, sans-serif',
  },
});

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
