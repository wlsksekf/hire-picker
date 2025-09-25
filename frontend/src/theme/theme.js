'use client';
import { createTheme } from '@mui/material/styles';

// v0에서 정의한 색상 변수를 기반으로 MUI 테마를 생성합니다.
export const theme = createTheme({
  palette: {
    primary: {
      main: '#20c997', // --primary-color
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280', // --text-muted
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff', // --background
      paper: '#ffffff', // --card-background
    },
    text: {
      primary: '#333333', // --foreground
      secondary: '#6b7280', // --text-muted
    },
    divider: '#e5e7eb', // --border-color
  },
  typography: {
    fontFamily: 'inherit', // RootLayout의 폰트를 그대로 사용
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10, // 0.625rem
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 버튼 텍스트 대문자화 비활성화
          boxShadow: 'none',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1ba085', // --primary-hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // --shadow
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // --shadow-lg
          }
        }
      }
    }
  }
});