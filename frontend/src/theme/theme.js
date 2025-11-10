'use client';
import { extendTheme } from '@mui/material/styles';
import { filterColors } from './filterPalette';
import { toRgbString } from '../utils/color';

function convertPalette(basePalette, mode) {
  const palette = JSON.parse(JSON.stringify(basePalette));

  if (palette.primary) {
    palette.primary.main = toRgbString(palette.primary.main);
    palette.primary.light = toRgbString(palette.primary.light);
    palette.primary.dark = toRgbString(palette.primary.dark);
  }
  if (palette.success?.main) palette.success.main = toRgbString(palette.success.main);
  if (palette.error?.main) palette.error.main = toRgbString(palette.error.main);
  if (palette.info?.main) palette.info.main = toRgbString(palette.info.main);

  if (palette.filters) {
    palette.filters = Object.fromEntries(
      Object.entries(filterColors).map(([key, value]) => [
        key,
        toRgbString(mode === 'dark' ? value.dark : value.light),
      ]),
    );
  }

  return palette;
}

const lightBasePalette = {
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
  filters: {},
};

const darkBasePalette = {
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
  filters: {},
};

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: convertPalette(lightBasePalette, 'light'),
    },
    dark: {
      palette: convertPalette(darkBasePalette, 'dark'),
    },
  },
  typography: {
    fontFamily:
      'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
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
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid #e8e8e8',
          '&:hover': {
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.07)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});

export default theme;
