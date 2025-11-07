'use client';
import { extendTheme } from '@mui/material/styles';
import { filterColors } from './filterPalette';

// Light 모드 필터 팔레트를 플랫한 객체로 변환
const lightFilterPalette = Object.fromEntries(
  Object.entries(filterColors).map(function([key, value]) { return [key, value.light] })
);

// MUI 테마 확장
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: 'oklch(0.76 0.17 170)', // 선명한 민트 (Vivid Mint)
          light: 'oklch(0.86 0.17 170)', // 밝은 버전
          dark: 'oklch(0.66 0.17 170)', // 어두운 버전
          contrastText: '#000000',
        },
        success: {
          main: 'oklch(0.76 0.20 140)', // 연한 그린 민트 (예시)
          contrastText: '#fff',
        },
        error: {
          main: 'oklch(0.66 0.13 27)', // 선명한 레드 (예시)
          contrastText: '#fff',
        },
        info: {
          main: 'oklch(0.70 0.18 220)', // 연파랑/민트톤
          contrastText: '#fff',
        },
        filters: lightFilterPalette,
      },
    },
    dark: {
      palette: {
        primary: {
          main: 'oklch(0.76 0.17 170)',
          light: 'oklch(0.86 0.17 170)',
          dark: 'oklch(0.66 0.17 170)',
          contrastText: '#000000',
        },
        success: {
          main: 'oklch(0.76 0.20 140)',
          contrastText: '#fff',
        },
        error: {
          main: 'oklch(0.66 0.13 27)',
          contrastText: '#fff',
        },
        info: {
          main: 'oklch(0.70 0.18 220)',
          contrastText: '#fff',
        },
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
      },
    },
  },
  typography: {
    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e8e8e8',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e8e8e8',
          '&:hover': {
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.07)'
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      }
    },
    MuiSelect: {
      defaultProps: {
        variant: 'filled',
      }
    }
  },
});

export default theme;
