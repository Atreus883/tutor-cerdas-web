import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useTheme } from './hooks/useTheme'

const styles = `
:root[data-theme="light"] {
  --bg: #f8f9fa;
  --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --panel: #ffffff;
  --text: #1a1a1a;
  --muted: #6c757d;
  --line: #dee2e6;
  --soft: #f1f3f5;
  --brand: #4a90e2;
  --brand-dark: #357abd;
  --brand-light: #e3f2fd;
  --success: #28a745;
  --success-light: #d4edda;
  --danger: #dc3545;
  --danger-light: #f8d7da;
  --shadow: rgba(0, 0, 0, 0.08);
  --shadow-md: rgba(0, 0, 0, 0.12);
  --shadow-lg: rgba(0, 0, 0, 0.16);
}

:root[data-theme="dark"] {
  --bg: #0f0f0f;
  --bg-gradient: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  --panel: #1e1e1e;
  --text: #e0e0e0;
  --muted: #a0a0a0;
  --line: #333333;
  --soft: #2a2a2a;
  --brand: #5b9aff;
  --brand-dark: #4a8ae8;
  --brand-light: rgba(74, 144, 226, 0.15);
  --success: #34d399;
  --success-light: rgba(40, 167, 69, 0.15);
  --danger: #f87171;
  --danger-light: rgba(220, 53, 69, 0.15);
  --shadow: rgba(0, 0, 0, 0.4);
  --shadow-md: rgba(0, 0, 0, 0.6);
  --shadow-lg: rgba(0, 0, 0, 0.8);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s ease, color 0.3s ease;
}

.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===== HEADER ===== */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 2px 8px var(--shadow);
  backdrop-filter: blur(12px);
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 0;
  flex-wrap: wrap;
}

.brand {
  font-weight: 700;
  font-size: clamp(18px, 3vw, 24px);
  letter-spacing: -0.5px;
  margin: 0;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.brand:hover {
  transform: translateY(-1px);
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
  border-radius: 8px;
  font-size: 18px;
}

.nav-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ===== NAVIGATION ===== */
.nav {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.nav a {
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--text);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav a:hover {
  background: var(--soft);
  transform: translateY(-1px);
}

.nav a.active {
  background: var(--brand-light);
  color: var(--brand);
  font-weight: 600;
}

/* ===== THEME TOGGLE ===== */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--soft);
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--line);
  transform: translateY(-1px);
}

.theme-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== USER INFO ===== */
.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--soft);
  border-radius: 10px;
  border: 1px solid var(--line);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
  border-radius: 50%;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--success);
}

.user-badge.admin {
  color: var(--danger);
}

.logout-btn {
  padding: 6px 12px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.logout-btn:hover {
  background: var(--danger-light);
  color: var(--danger);
  border-color: var(--danger);
  transform: translateY(-1px);
}

/* ===== MAIN CONTENT ===== */
.app-main {
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 140px);
}

/* ===== FOOTER ===== */
.app-footer {
  border-top: 1px solid var(--line);
  background: var(--panel);
  padding: 16px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
}

.footer-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-link {
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--brand);
}

/* ===== LOADING STATE ===== */
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  background: var(--bg);
  color: var(--text);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: var(--muted);
  font-weight: 500;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .app-container {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .app-header-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .brand {
    justify-content: center;
  }

  .nav-wrapper {
    flex-direction: column;
    gap: 12px;
  }

  .nav {
    width: 100%;
    justify-content: center;
  }

  .user-section {
    justify-content: center;
  }

  .theme-toggle {
    align-self: center;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav {
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .nav a {
    width: 100%;
    justify-content: center;
  }

  .logout-btn {
    width: 100%;
  }
}
`

export default function App() {
  const { user, isAdmin, isAuthenticated, signOut, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserInitials = () => {
    if (user?.full_name) {
      const names = user.full_name.split(' ')
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return '?'
  }

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <div className="loading-text">Memuat aplikasi...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-root">
        <header className="app-header">
          <div className="app-container">
            <div className="app-header-inner">
              <h1 className="brand">
                <span className="brand-icon">🎓</span>
                Tutor Cerdas
              </h1>
              
              <div className="nav-wrapper">
                <nav className="nav" aria-label="Main navigation">
                  <NavLink to="/" end>🏠 Home</NavLink>
                  
                  {!isAuthenticated && (
                    <>
                      <NavLink to="/login">🔐 Login</NavLink>
                      <NavLink to="/register">✨ Register</NavLink>
                    </>
                  )}
                  
                  {isAuthenticated && (
                    <>
                      {isAdmin && <NavLink to="/admin">⚙️ Admin</NavLink>}
                      <NavLink to="/user">💬 Chat</NavLink>
                    </>
                  )}
                </nav>

                <button 
                  className="theme-toggle" 
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  <span className="theme-icon">
                    {theme === 'light' ? '🌙' : '☀️'}
                  </span>
                </button>

                {isAuthenticated && (
                  <div className="user-section">
                    <div className="user-avatar">{getUserInitials()}</div>
                    <div className="user-info">
                      <div className="user-name">
                        {user?.full_name || user?.email?.split('@')[0] || 'User'}
                      </div>
                      <span className={`user-badge ${isAdmin ? 'admin' : ''}`}>
                        {isAdmin ? '👑 Admin' : '👤 User'}
                      </span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="app-main">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div className="app-container">
            <div className="footer-content">
              <div>
                © 2024 Tutor Cerdas • <strong>MVP Version</strong>
              </div>
              <div className="footer-links">
                <a href="#" className="footer-link">React</a>
                <span style={{ color: 'var(--line)' }}>•</span>
                <a href="#" className="footer-link">Express</a>
                <span style={{ color: 'var(--line)' }}>•</span>
                <a href="#" className="footer-link">Supabase</a>
                <span style={{ color: 'var(--line)' }}>•</span>
                <a href="#" className="footer-link">Auth</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}