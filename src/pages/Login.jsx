import { useState } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const styles = `
.login-scope{ --bg:#0b1020; --panel:#0f152a; --muted:#9aa8c1; --text:#e9eef6;
  --line:rgba(255,255,255,.12); --soft:rgba(255,255,255,.06); --brand:#6c9ef8; --err:#ef4444;
}
*{box-sizing:border-box}

.login-wrap{
  min-height:100svh; display:grid; place-items:center; padding:24px; position:relative; overflow:hidden;
  color:var(--text);
  background:
    radial-gradient(1200px 600px at 10% -10%, #1a2249 0%, transparent 70%),
    radial-gradient(1000px 500px at 110% 10%, #0b614d 0%, transparent 65%),
    linear-gradient(180deg, #0b1020 0%, #0a0d18 100%);
}

.login-card{
  width:min(420px, 92%);
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);
  border-radius:20px; padding:28px;
  backdrop-filter:blur(10px);
  box-shadow:0 20px 50px rgba(0,0,0,.35);
}

.login-title{ margin:0 0 8px; font-size:clamp(20px,3vw,28px); font-weight:800; text-align:center; }
.login-sub{ margin:0 0 24px; color:var(--muted); text-align:center; font-size:14px; }

.login-form{ display:grid; gap:16px; }
.login-input{
  width:100%; padding:12px 14px; border-radius:12px; border:1px solid var(--line);
  background:var(--soft); color:inherit; outline:none;
}
.login-input::placeholder{ color:var(--muted); }

.login-btn{
  width:100%; padding:14px; border-radius:12px; font-weight:700; border:none; cursor:pointer;
  background:linear-gradient(135deg, #7ba3ff 0%, #5f7aff 100%); color:#fff;
  transition:transform .12s ease, box-shadow .12s ease; box-shadow:0 8px 18px rgba(0,0,0,.25);
}
.login-btn:hover{ transform:translateY(-1px); box-shadow:0 12px 24px rgba(0,0,0,.35); }
.login-btn:disabled{ opacity:.6; cursor:not-allowed; transform:none; }

.login-error{
  background:rgba(239,68,68,.12); color:#ef4444; border:1px solid rgba(239,68,68,.35);
  padding:12px; border-radius:12px; font-size:14px;
}

.login-links{ margin-top:16px; text-align:center; font-size:14px; color:var(--muted); }
.login-links a{ color:var(--brand); text-decoration:none; }
.login-links a:hover{ text-decoration:underline; }
`

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, isAuthenticated } = useAuth()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email dan password harus diisi')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signIn(email.trim(), password)
      // Navigation will happen automatically via AuthContext
    } catch (err) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-scope">
      <style>{styles}</style>
      
      <div className="login-wrap">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <p className="login-sub">Masuk ke Tutor Cerdas</p>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="login-links">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
          </div>
        </div>
      </div>
    </div>
  )
}