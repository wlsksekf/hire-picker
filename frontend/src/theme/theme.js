'use client';
import { extendTheme } from '@mui/material/styles';
import { filterColors } from './filterPalette';

// Light 모드 필터 팔레트를 플랫한 객체로 변환
const lightFilterPalette = Object.fromEntries(
  Object.entries(filterColors).map(function([key, value]) { return [key, value.light] })
);

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: 'oklch(0.70 0.30 165)',
          light: 'oklch(0.80 0.30 165)', // 밝은 버전
          dark: 'oklch(0.60 0.30 165)',  // 어두운 버전
          contrastText: '#ffffff',
        },
        filters: lightFilterPalette, // 수정된 부분
      },
    },
    dark: {
      palette: {
        primary: {
          main: 'oklch(0.70 0.30 165)',
          light: 'oklch(0.80 0.30 165)',
          dark: 'oklch(0.60 0.30 165)',
          contrastText: '#ffffff',
        },
        background: {
          default: '#121212',
          paper: '#1E1E1E',
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.87)',
          secondary: 'rgba(255, 255, 255, 0.6)',
        },
        filters: { // 이 구조는 이미 올바르게 플랫합니다.
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
    borderRadius: 12, // 전역 둥근 모서리 값 설정
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