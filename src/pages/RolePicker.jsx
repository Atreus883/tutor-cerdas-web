import { Link } from 'react-router-dom'

const styles = `
.rp-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  color: var(--text);
  transition: background 0.3s ease;
}

/* Light Mode Background */
:root[data-theme="light"] .rp-wrap {
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(102, 126, 234, 0.15) 0%, transparent 70%),
    radial-gradient(1000px 500px at 110% 10%, rgba(99, 225, 179, 0.15) 0%, transparent 65%),
    linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Dark Mode Background */
:root[data-theme="dark"] .rp-wrap {
  background:
    radial-gradient(1200px 600px at 10% -10%, #1a2249 0%, transparent 70%),
    radial-gradient(1000px 500px at 110% 10%, #0b614d 0%, transparent 65%),
    linear-gradient(180deg, #0b1020 0%, #0a0d18 100%);
}

.rp-card {
  width: min(560px, 92%);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 32px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 50px var(--shadow-lg);
  position: relative;
  transition: all 0.3s ease;
}

:root[data-theme="dark"] .rp-card {
  background: rgba(255, 255, 255, 0.06);
}

.rp-title {
  margin: 0 0 8px;
  font-size: clamp(24px, 3.2vw, 36px);
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text);
}

.rp-sub {
  margin: 0 0 24px;
  color: var(--muted);
  font-size: 15px;
}

.rp-actions {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
}

@media (min-width: 560px) {
  .rp-actions {
    grid-template-columns: 1fr 1fr;
  }
}

.rp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.rp-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.rp-btn:hover::before {
  opacity: 1;
}

.rp-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.rp-btn:active {
  transform: translateY(0);
}

.rp-btn-admin {
  background: linear-gradient(135deg, #7ba3ff 0%, #5f7aff 100%);
}

.rp-btn-user {
  background: linear-gradient(135deg, #63e1b3 0%, #3fcf9f 100%);
}

.rp-icon {
  font-size: 20px;
}

.rp-foot {
  margin-top: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.dot:hover {
  opacity: 1;
}

.dot.green {
  background: #6ee7b7;
}

.dot.yellow {
  background: #ffd36d;
}

.dot.red {
  background: #ff7a7a;
}

.rp-blur {
  position: absolute;
  filter: blur(90px);
  opacity: 0.35;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

:root[data-theme="light"] .rp-blur {
  opacity: 0.15;
}

.rp-blur-1 {
  width: 300px;
  height: 300px;
  left: -60px;
  bottom: -40px;
  background: #7ba3ff;
}

.rp-blur-2 {
  width: 260px;
  height: 260px;
  right: -40px;
  top: -20px;
  background: #63e1b3;
}

@media (max-width: 560px) {
  .rp-card {
    padding: 24px;
  }

  .rp-btn {
    padding: 14px 18px;
  }
}
`

export default function RolePicker() {
  return (
    <>
      <style>{styles}</style>

      <div className="rp-wrap">
        <div className="rp-card" role="group" aria-label="Pilih Peran">
          <h1 className="rp-title">Pilih Peran</h1>
          <p className="rp-sub">Untuk MVP, silakan pilih halaman tujuan.</p>

          <div className="rp-actions">
            <Link to="/admin" className="rp-btn rp-btn-admin" aria-label="Masuk sebagai Admin">
              <span className="rp-icon" aria-hidden>🛠️</span>
              Masuk Admin
            </Link>

            <Link to="/user" className="rp-btn rp-btn-user" aria-label="Masuk sebagai User">
              <span className="rp-icon" aria-hidden>🎓</span>
              Masuk User
            </Link>
          </div>

          <div className="rp-foot" aria-hidden>
            <span className="dot green" />
            <span className="dot yellow" />
            <span className="dot red" />
          </div>
        </div>

        <div className="rp-blur rp-blur-1" />
        <div className="rp-blur rp-blur-2" />
      </div>
    </>
  )
}