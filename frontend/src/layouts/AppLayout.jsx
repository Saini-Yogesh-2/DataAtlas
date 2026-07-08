import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Database, 
  GitFork, 
  ShieldAlert, 
  Workflow, 
  Activity, 
  Users, 
  BarChart3, 
  Menu, 
  Sun, 
  Moon, 
  LogOut, 
  X,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import styles from '../styles/AppLayout.module.css';

const AppLayout = () => {
  const { 
    theme, 
    toggleTheme, 
    connectionDetails, 
    logout, 
    notifications, 
    dismissNotification 
  } = useApp();
  
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();

  // Secure connection states and window interface
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connHost, setConnHost] = useState('');
  const [connToken, setConnToken] = useState('');
  const [connWarehouse, setConnWarehouse] = useState('');
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [connectError, setConnectError] = useState('');
  const { login } = useApp();

  useEffect(() => {
    if (!isConnectModalOpen) {
      setConnectError('');
    }
  }, [isConnectModalOpen]);

  useEffect(() => {
    window.openConnectModal = () => setIsConnectModalOpen(true);
    return () => {
      delete window.openConnectModal;
    };
  }, []);

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!connHost.startsWith('https://')) {
      setConnectError('Host URL must start with https://');
      return;
    }
    try {
      setLoadingConnect(true);
      setConnectError('');
      await login(connHost, connToken, connWarehouse);
      setIsConnectModalOpen(false);
      setConnHost('');
      setConnToken('');
      setConnWarehouse('');
    } catch (err) {
      console.error('Connection failed:', err);
      setConnectError(err.message || 'Establish Connection Failed.');
    } finally {
      setLoadingConnect(false);
    }
  };

  // Navigation schema items
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Global Search', path: '/search', icon: Search },
    { name: 'Data Catalog', path: '/catalog', icon: Database },
    { name: 'Lineage Explorer', path: '/lineage', icon: GitFork },
    { name: 'Impact Analysis', path: '/impact', icon: ShieldAlert },
    { name: 'Job Explorer', path: '/jobs', icon: Workflow },
    { name: 'Pipeline Explorer', path: '/pipelines', icon: Activity },
    { name: 'Ownership Center', path: '/ownership', icon: Users },
    { name: 'Metadata Analytics', path: '/analytics', icon: BarChart3 }
  ];

  // Helper to generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ label: 'DataAtlas', path: '/' }, { label: 'Dashboard', path: '/' }];
    
    const breadcrumbs = [{ label: 'DataAtlas', path: '/' }];
    let currentPath = '';
    
    paths.forEach((p, idx) => {
      currentPath += `/${p}`;
      const capitalized = p.charAt(0).toUpperCase() + p.slice(1);
      
      // Handle special parameters
      if (p.length > 20) {
        breadcrumbs.push({ label: `${p.slice(0, 10)}...`, path: currentPath });
      } else {
        breadcrumbs.push({ label: capitalized, path: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  return (
    <div className={styles.wrapper}>
      {/* --- Sidebar Nav Panel --- */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : styles.sidebarMobileOpen}`}>
        <div className={styles.sidebarHeader}>
          <GitFork className={styles.logoIcon} size={28} />
          <span className={`${styles.logoText} ${collapsed ? styles.logoTextHidden : ''}`}>
            DataAtlas
          </span>
          {/* Collapse arrow — only visible on desktop when sidebar is open */}
          {!collapsed && (
            <button
              className={`${styles.menuBtn} ${styles.sidebarCollapseBtn}`}
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <Icon size={20} />
                <span className={`${styles.navLabel} ${collapsed ? styles.navLabelHidden : ''}`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button 
            onClick={logout} 
            className={styles.navItem} 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            <span className={`${styles.navLabel} ${collapsed ? styles.navLabelHidden : ''}`}>
              Disconnect
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop close listener */}
      {!collapsed && (
        <div className={styles.mobileBackdrop} onClick={() => setCollapsed(true)} />
      )}

      {/* --- Main Contents Panel --- */}
      <main className={`${styles.main} ${collapsed ? styles.mainShifted : ''}`}>
        {/* Header toolbar */}
        <header className={styles.header}>
        <div className={styles.headerLeft}>
            {/* Hamburger: always rendered; CSS hides it on desktop when sidebar is expanded */}
            <button
              className={`${styles.menuBtn} ${!collapsed ? styles.menuBtnHidden : ''}`}
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className={styles.headerRight}>
            {/* Search shortcut bar */}
            {location.pathname !== '/search' && (
              <div className={styles.searchBar} onClick={() => navigate('/search')}>
                <Search size={16} />
                <span>Search catalog...</span>
              </div>
            )}

            {/* Connection mode badges */}
            {connectionDetails && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`${styles.badge} ${connectionDetails.mode === 'Simulation' ? styles.badgeSimulation : ''}`}>
                  {connectionDetails.mode} Mode
                </span>
                
                {connectionDetails.mode === 'Simulation' ? (
                  <button 
                    onClick={() => setIsConnectModalOpen(true)}
                    className="btn btn-secondary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.725rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--color-amber)',
                      borderColor: 'var(--color-amber)',
                      backgroundColor: 'rgba(217, 119, 6, 0.05)',
                      cursor: 'pointer'
                    }}
                  >
                    🔌 Connect Live DB
                  </button>
                ) : (
                  <button 
                    onClick={logout}
                    className="btn btn-secondary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.725rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--color-rose)',
                      borderColor: 'var(--color-rose)',
                      backgroundColor: 'rgba(244, 63, 94, 0.05)',
                      cursor: 'pointer'
                    }}
                  >
                    Disconnect
                  </button>
                )}
              </div>
            )}

            {/* Dark mode button toggler */}
            <button className={styles.menuBtn} onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Active profile badge */}
            <div className={styles.profile}>
              <div className={styles.avatar}>
                {connectionDetails?.user?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 500,
                maxWidth: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {connectionDetails?.user || 'Demo Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page container */}
        <div className={styles.content}>
          {/* Breadcrumb row shown above each page */}
          <div className={styles.breadcrumbs}>
            {getBreadcrumbs().map((b, idx, arr) => (
              <React.Fragment key={b.path + idx}>
                <NavLink to={b.path} className={styles.breadcrumbLink}>
                  {b.label}
                </NavLink>
                {idx < arr.length - 1 && <span style={{ margin: '0 0.25rem', color: 'var(--color-text-muted)' }}>/</span>}
              </React.Fragment>
            ))}
          </div>
          <Outlet />
        </div>
      </main>

      {/* --- Global Notifications Overlay Panel --- */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '360px',
          width: '100%'
        }}
      >
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`animate-fade`}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              borderLeft: `4px solid ${
                n.type === 'success' ? 'var(--color-emerald)' : 
                n.type === 'error' ? 'var(--color-rose)' : 
                n.type === 'warning' ? 'var(--color-amber)' : 'var(--color-blue)'
              }`,
              backgroundColor: 'var(--color-card)',
              borderTop: '1px solid var(--color-border)',
              borderBottom: '1px solid var(--color-border)',
              borderRight: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              fontSize: '0.875rem'
            }}
          >
            <span style={{ flex: 1, marginRight: '12px' }}>{n.message}</span>
            <button 
              onClick={() => dismissNotification(n.id)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      {isConnectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--color-card)',
            padding: '1.75rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={22} style={{ color: 'var(--color-blue)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Connect Databricks Workspace</h3>
              </div>
              <button 
                onClick={() => setIsConnectModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              Enter your workspace connection details to profile your actual Unity Catalog datasets, schemas, and live lineages in DataAtlas.
            </p>

            {/* SECURITY ASSURANCES BANNER */}
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '8px',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.8125rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-blue)' }}>
                <ShieldCheck size={16} />
                <span>🔒 Temporary Client-Side Memory Session</span>
              </div>
              <span style={{ color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                Your credentials are held solely inside active browser volatile state memory (`sessionStorage`) and sent in secure headers directly on metadata request lookups. They are <b style={{ color: 'var(--color-blue)' }}>never stored on disk, never written to any database</b>, and instantly cleared when you click Disconnect or close the browser tab.
              </span>
            </div>

            {connectError && (
              <div style={{
                backgroundColor: 'rgba(244, 63, 94, 0.05)',
                border: '1px solid rgba(244, 63, 94, 0.15)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: 'var(--color-rose)',
                fontSize: '0.8125rem',
                lineHeight: 1.3
              }}>
                ⚠️ {connectError}
              </div>
            )}

            <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                  WORKSPACE HOST URL
                </label>
                <input
                  type="url"
                  className="input"
                  required
                  placeholder="https://dbc-12345678-abcd.cloud.databricks.com"
                  value={connHost}
                  onChange={(e) => setConnHost(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                  PERSONAL ACCESS TOKEN (PAT)
                </label>
                <input
                  type="password"
                  className="input"
                  required
                  placeholder="dapi1234567890abcdef..."
                  value={connToken}
                  onChange={(e) => setConnToken(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                  SQL WAREHOUSE HTTP PATH (OPTIONAL)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="/sql/1.0/warehouses/1234567890abcdef"
                  value={connWarehouse}
                  onChange={(e) => setConnWarehouse(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsConnectModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loadingConnect}
                  style={{ flex: 1, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {loadingConnect ? 'Connecting...' : 'Establish Connection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
