import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const styles = `
.register-scope{ --bg:#0b1020; --panel:#0f152a; --muted:#9aa8c1; --text:#e9eef6;
  --line:rgba(255,255,255,.12); --soft:rgba(255,255,255,.06); --brand:#6c9ef8; --err:#ef4444; --ok:#34d399;
}
*{box-sizing:border-box}

.register-wrap{
  min-height:100svh; display:grid; place-items:center; padding:24px; position:relative; overflow:hidden;
  color:var(--text);
  background:
    radial-gradient(1200px 600px at 10% -10%, #1a2249 0%, transparent 70%),
    radial-gradient(1000px 500px at 110% 10%, #0b614d 0%, transparent 65%),
    linear-gradient(180deg, #0b1020 0%, #0a0d18 100%);
}

.register-card{
  width:min(420px, 92%);
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);
  border-radius:20px; padding:28px;
  backdrop-filter:blur(10px);
  box-shadow:0 20px 50px rgba(0,0,0,.35);
}

.register-title{ margin:0 0 8px; font-size:clamp(20px,3vw,28px); font-weight:800; text-align:center; }
.register-sub{ margin:0 0 24px; color:var(--muted); text-align:center; font-size:14px; }

.register-form{ display:grid; gap:16px; }
.register-input{
  width:100%; padding:12px 14px; border-radius:12px; border:1px solid var(--line);
  background:var(--soft); color:inherit; outline:none;
}
.register-input::placeholder{ color:var(--muted); }

.register-btn{
  width:100%; padding:14px; border-radius:12px; font-weight:700; border:none; cursor:pointer;
  background:linear-gradient(135deg, #63e1b3 0%, #3fcf9f 100%); color:#fff;
  transition:transform .12s ease, box-shadow .12s ease; box-shadow:0 8px 18px rgba(0,0,0,.25);
}
.register-btn:hover{ transform:translateY(-1px); box-shadow:0 12px 24px rgba(0,0,0,.35); }
.register-btn:disabled{ opacity:.6; cursor:not-allowed; transform:none; }

.register-error{
  background:rgba(239,68,68,.12); color:#ef4444; border:1px solid rgba(239,68,68,.35);
  padding:12px; border-radius:12px; font-size:14px;
}

.register-success{
  background:rgba(52,211,153,.12); color:#10b981; border:1px solid rgba(16,185,129,.25);
  padding:12px; border-radius:12px; font-size:14px;
}

.register-links{ margin-top:16px; text-align:center; font-size:14px; color:var(--muted); }
.register-links a{ color:var(--brand); text-decoration:none; }
.register-links a:hover{ text-decoration:underline; }
`

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    const { email, password, confirmPassword, fullName } = formData
    
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setError('Semua field harus diisi')
      return
    }

    if (password !== confirmPassword) {
      setError('Password tidak sama')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signUp(email.trim(), password, {
        full_name: fullName.trim()
      })
      
      setSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.')
      
      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-scope">
      <style>{styles}</style>
      
      <div className="register-wrap">
        <div className="register-card">
          <h1 className="register-title">Daftar</h1>
          <p className="register-sub">Buat akun baru di Tutor Cerdas</p>

          {error && (
            <div className="register-error">{error}</div>
          )}

          {success && (
            <div className="register-success">{success}</div>
          )}

          <form className="register-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullName"
              placeholder="Nama Lengkap"
              className="register-input"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
            />
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="register-input"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="register-input"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            
            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              className="register-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
            
            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>

          <div className="register-links">
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  )
}