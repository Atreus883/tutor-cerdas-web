import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'
import App from './App.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Lazy-load pages
const RolePicker = React.lazy(() => import('./pages/RolePicker.jsx'))
const Admin = React.lazy(() => import('./pages/Admin.jsx'))
const User = React.lazy(() => import('./pages/User.jsx'))
const Login = React.lazy(() => import('./pages/Login.jsx'))
const Register = React.lazy(() => import('./pages/Register.jsx'))
const Unauthorized = React.lazy(() => import('./pages/Unauthorized.jsx'))

// Error & Loading components
function ErrorPage({ title = 'Terjadi kesalahan', detail }) {
  return (
    <div style={{ 
      padding: 24, 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 12,
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{title}</h2>
      <div style={{ opacity: 0.7, textAlign: 'center' }}>
        {detail || 'Silakan coba muat ulang halaman.'}
      </div>
      <button 
        onClick={() => window.location.href = '/'} 
        style={{
          marginTop: 16,
          padding: '10px 20px',
          background: 'var(--brand)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        🏠 Kembali ke Home
      </button>
    </div>
  )
}

function NotFound() {
  return (
    <ErrorPage 
      title="404 - Halaman tidak ditemukan" 
      detail="Cek kembali URL yang kamu akses." 
    />
  )
}

function LoadingFallback() {
  return (
    <div style={{
      padding: 24,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '4px solid var(--line)',
        borderTopColor: 'var(--brand)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <div style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500 }}>
        Memuat halaman...
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Base path configuration
const basename = (import.meta.env.BASE_URL?.replace(/\/+$/, '')) ||
                 (import.meta.env.VITE_BASE_PATH || '').replace(/\/+$/, '')

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { 
        index: true, 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RolePicker />
          </Suspense>
        )
      },
      { 
        path: 'login', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        )
      },
      { 
        path: 'register', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Register />
          </Suspense>
        )
      },
      { 
        path: 'unauthorized', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Unauthorized />
          </Suspense>
        )
      },
      {
        path: 'admin',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          </Suspense>
        )
      },
      {
        path: 'user',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProtectedRoute requireAuth>
              <User />
            </ProtectedRoute>
          </Suspense>
        )
      },
      { 
        path: '*', 
        element: <NotFound /> 
      },
    ],
  },
], { basename })

// Render app - ONLY ONCE!
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)