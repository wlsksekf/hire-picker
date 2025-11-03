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
          dark: 'oklch(0.66 0.17 170)',  // 어두운 버전
          contrastText: '#000000', // 대비 텍스트 색상 (밝은 배경이므로 어둡게)
        },
        filters: lightFilterPalette, // 필터 색상 팔레트
      },
    },
    dark: {
      palette: {
        primary: {
          main: 'oklch(0.76 0.17 170)', // 선명한 민트 (Vivid Mint)
          light: 'oklch(0.86 0.17 170)',
          dark: 'oklch(0.66 0.17 170)',
          contrastText: '#000000', // 대비 텍스트 색상
        },
        background: {
          default: '#121212', // 기본 배경색
          paper: '#1E1E1E', // 종이 배경색
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.87)', // 주 텍스트 색상
          secondary: 'rgba(255, 255, 255, 0.6)', // 보조 텍스트 색상
        },
        filters: { // 다크 모드 필터 색상 팔레트
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
          boxShadow: 'none', // 버튼 그림자 제거
        },
        contained: {
          '&:hover': {
            boxShadow: 'none', // 호버 시 버튼 그림자 제거
          },
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                boxShadow: 'none', // 종이 그림자 제거
                border: '1px solid #e8e8e8', // 테두리 추가
            }
        }
    },
    MuiCard: {
        styleOverrides: {
            root: {
                boxShadow: 'none', // 카드 그림자 제거
                border: '1px solid #e8e8e8', // 테두리 추가
                '&:hover': {
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.07)' // 호버 시 그림자 효과
                }
            }
        }
    },
    MuiTextField: {
        defaultProps: {
            variant: 'filled', // 텍스트 필드 기본 variant 설정
        }
    },
    MuiSelect: {
        defaultProps: {
            variant: 'filled', // 선택 상자 기본 variant 설정
        }
    }
  },
});

export default theme;
