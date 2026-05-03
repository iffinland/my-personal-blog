import { type FC, type ReactNode } from 'react';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import './styles/layout.css';

const Layout: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="app-layout">
    <AppHeader />
    <div className="app-layout__body">
      <AppSidebar />
      <main className="app-layout__content">{children}</main>
    </div>
  </div>
);

export default Layout;
