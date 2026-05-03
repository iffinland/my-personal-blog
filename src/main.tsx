import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import ThemeProviderWrapper from './styles/theme/theme-provider';
import { IdentityProvider } from './features/identity/context/IdentityContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProviderWrapper>
      <IdentityProvider>
        <App />
      </IdentityProvider>
    </ThemeProviderWrapper>
  </StrictMode>,
);
