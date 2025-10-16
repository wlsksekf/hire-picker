'use client';

import React, { useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { filterColors } from '../theme/filterPalette';
import Header from './Header';
import Footer from './Footer';
import { Box, Container } from '@mui/material';
import { oklch2rgb } from 'colorizr';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeModeContext } from '../theme/ThemeModeContext';

// Create a client
const queryClient = new QueryClient();

// oklch(l c h) 문자열을 rgb(r, g, b) 문자열로 변환하는 헬퍼 함수
const convertOklchToRgb = (oklchStr) => {
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
};

// 테마 생성 로직
const getTheme = (mode) => {
  // ... (rest of the getTheme function is unchanged)
  const oklchPalette = {
    mode,
    primary: {
      main: 'oklch(0.70 0.30 165)',
      light: 'oklch(0.80 0.30 165)',
      dark: 'oklch(0.60 0.30 165)',
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

  return createTheme({
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
};

export default function AppProviders({ children }) {
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeContext.Provider value={{ mode, setMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
              {children}
            </Container>
            <Footer />
          </Box>
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </QueryClientProvider>
  );
}
