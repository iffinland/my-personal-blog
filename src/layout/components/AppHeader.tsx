import { useAtom } from 'jotai';
import { type EnumTheme, themeAtom } from '../../state/global/system';
import { useIdentity } from '../../features/identity/context/IdentityContext';

const AppHeader = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const { activeName, isDeveloper } = useIdentity();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <a href="/" className="app-header__brand">
          <span className="app-header__icon">🌲</span>
          <span className="app-header__title">iffi's Wildlife Blog</span>
        </a>
        <nav className="app-header__nav">
          <a href="/" className="app-header__link">Blog</a>
          <a href="/gallery" className="app-header__link">Gallery</a>
          <a href="/videos" className="app-header__link">Videos</a>
          <a href="/guestbook" className="app-header__link">Guestbook</a>
        </nav>
        <div className="app-header__actions">
          <div className="app-header__theme-toggle">
            <button className={`app-header__theme-btn ${theme === 'LIGHT' ? 'app-header__theme-btn--active' : ''}`}
              onClick={() => setTheme('LIGHT' as EnumTheme)} title="Light">☀️</button>
            <button className={`app-header__theme-btn ${theme === 'DARK' ? 'app-header__theme-btn--active' : ''}`}
              onClick={() => setTheme('DARK' as EnumTheme)} title="Dark">🌙</button>
          </div>
          {activeName && (
            <span className="app-header__user">
              {activeName}{isDeveloper && <span className="app-header__dev-badge">DEV</span>}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
