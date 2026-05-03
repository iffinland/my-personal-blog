import { createTheme } from '@mui/material/styles';

const common = {
  typography: {
    fontFamily: ['Inter'].join(','),
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.75rem', fontWeight: 500 },
    h3: { fontSize: '1.5rem', fontWeight: 500 },
    h4: { fontSize: '1.25rem', fontWeight: 500 },
    h5: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
  },
  spacing: 8,
  shape: { borderRadius: 8 },
};

export const lightTheme = createTheme({
  ...common,
  palette: {
    mode: 'light',
    primary: { main: '#3D5A2E', dark: '#2A401E', light: '#5A7F3E' },
    secondary: { main: '#8B6F47', dark: '#6B5235', light: '#A88B63' },
    background: { default: '#F5F3EE', paper: '#FAF8F4' },
    text: { primary: '#2C2A26', secondary: '#5C584E' },
  },
});

export const darkTheme = createTheme({
  ...common,
  palette: {
    mode: 'dark',
    primary: { main: '#7CB342', dark: '#558B2F', light: '#9CCC65' },
    secondary: { main: '#A1887F', dark: '#795548', light: '#BCAAA4' },
    background: { default: '#1A1C16', paper: '#24261E' },
    text: { primary: '#E8E5DD', secondary: '#9E9A8E' },
  },
});
