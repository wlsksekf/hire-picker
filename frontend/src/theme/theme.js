'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#20C997',
      contrastText: '#ffffff', // 버튼 텍스트 색상을 흰색으로 명시
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