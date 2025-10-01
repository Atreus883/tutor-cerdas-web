import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
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
    <div style={{padding:24}}>
      <h2 style={{margin:'0 0 6px'}}>{title}</h2>
      <div style={{opacity:.7}}>{detail || 'Silakan coba muat ulang halaman.'}</div>
    </div>
  )
}

function NotFound() {
  return <ErrorPage title="404 - Halaman tidak ditemukan" detail="Cek kembali URL yang kamu akses." />
}

const basename = (import.meta.env.BASE_URL?.replace(/\/+$/, '')) || 
                 (import.meta.env.VITE_BASE_PATH || '').replace(/\/+$/, '')

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <RolePicker /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'unauthorized', element: <Unauthorized /> },
      { 
        path: 'admin', 
        element: (
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        )
      },
      { 
        path: 'user', 
        element: (
          <ProtectedRoute requireAuth>
            <User />
          </ProtectedRoute>
        )
      },
      { path: '*', element: <NotFound /> },
    ],
  },
], { basename })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Suspense fallback={<div style={{padding:24}}>Loading…</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  </React.StrictMode>
)