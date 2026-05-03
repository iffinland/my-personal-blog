import { type FC, type ReactNode } from 'react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme, darkTheme } from './theme';
import CssBaseline from '@mui/material/CssBaseline';
import { useAtom } from 'jotai';
import { themeAtom } from '../../state/global/system';

const ThemeProviderWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme] = useAtom(themeAtom);
  return (
    <ThemeProvider theme={theme === 'LIGHT' ? lightTheme : darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
