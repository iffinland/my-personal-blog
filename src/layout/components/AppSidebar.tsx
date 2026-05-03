import { useIdentity } from '../../features/identity/context/IdentityContext';

const AppSidebar = () => {
  const { isDeveloper, activeName } = useIdentity();
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__section">
        <h3>🌿 About</h3>
        <p>A personal wildlife blog by {activeName || 'iffi'}.</p>
        <p>Exploring forests, rivers, and the wild through words, photos, and videos.</p>
      </div>
      {isDeveloper && (
        <div className="app-sidebar__section app-sidebar__dev">
          <h3>⚡ Developer Tools</h3>
          <p className="app-sidebar__hint">Logged in as {activeName}. Create blog posts, upload media.</p>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;
