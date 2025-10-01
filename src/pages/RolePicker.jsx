import { Link } from 'react-router-dom'

const styles = `
.rp-scope{ --bg:#0b1020; --text:#e8ecf1; --muted:#a6b0c3; --brand1:#6c9ef8; --brand2:#60e2b2; }
*{box-sizing:border-box}

.rp-wrap{
  min-height:100svh; display:grid; place-items:center; padding:24px; position:relative; overflow:hidden;
  color:var(--text);
  background:
    radial-gradient(1200px 600px at 10% -10%, #1a2249 0%, transparent 70%),
    radial-gradient(1000px 500px at 110% 10%, #0b614d 0%, transparent 65%),
    linear-gradient(180deg, #0b1020 0%, #0a0d18 100%);
}

.rp-card{
  width:min(560px, 92%);
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);
  border-radius:20px; padding:28px;
  backdrop-filter:blur(10px);
  box-shadow:0 20px 50px rgba(0,0,0,.35);
  position:relative;
}

.rp-title{ margin:0 0 6px; font-size:clamp(22px,3.2vw,32px); letter-spacing:.2px; }
.rp-sub{ margin:0 0 20px; color:var(--muted); }

.rp-actions{ display:grid; gap:14px; grid-template-columns:1fr; }
@media (min-width:560px){ .rp-actions{ grid-template-columns:1fr 1fr; } }

.rp-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:10px;
  padding:14px 18px; border-radius:12px; font-weight:600; text-decoration:none;
  color:var(--text); border:1px solid rgba(255,255,255,.15);
  background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
  box-shadow:0 8px 18px rgba(0,0,0,.25);
  transition:transform .12s ease, box-shadow .12s ease, filter .15s ease;
}
.rp-btn:hover{ transform:translateY(-1px); box-shadow:0 12px 24px rgba(0,0,0,.35); }
.rp-btn:active{ transform:translateY(0); }

.rp-btn-admin{ background:linear-gradient(135deg, #7ba3ff 0%, #5f7aff 100%); }
.rp-btn-user { background:linear-gradient(135deg, #63e1b3 0%, #3fcf9f 100%); }
.rp-btn-admin:hover, .rp-btn-user:hover{ filter:brightness(1.05); }

.rp-icon{ font-size:18px; }
.rp-foot{ margin-top:16px; display:flex; gap:8px; align-items:center; }
.dot{ width:8px; height:8px; border-radius:999px; display:inline-block; opacity:.7; }
.dot.green{ background:#6ee7b7 } .dot.yellow{ background:#ffd36d } .dot.red{ background:#ff7a7a }

.rp-blur{ position:absolute; filter:blur(90px); opacity:.35; pointer-events:none; }
.rp-blur-1{ width:300px; height:300px; left:-60px; bottom:-40px; background:var(--brand1); }
.rp-blur-2{ width:260px; height:260px; right:-40px; top:-20px; background:var(--brand2); }
`

export default function RolePicker() {
  return (
    <div className="rp-scope">
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
    </div>
  )
}
