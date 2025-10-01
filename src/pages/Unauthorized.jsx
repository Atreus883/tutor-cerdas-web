import { Link } from 'react-router-dom'

const styles = `
.unauth-scope{ --bg:#0b1020; --text:#e9eef6; --muted:#9aa8c1; --brand:#6c9ef8; }
*{box-sizing:border-box}

.unauth-wrap{
  min-height:100svh; display:grid; place-items:center; padding:24px;
  color:var(--text); background:var(--bg);
}

.unauth-card{
  text-align:center; max-width:480px;
}

.unauth-title{ margin:0 0 12px; font-size:clamp(24px,4vw,36px); font-weight:800; }
.unauth-sub{ margin:0 0 24px; color:var(--muted); line-height:1.6; }
.unauth-link{
  display:inline-block; padding:12px 20px; background:var(--brand); color:#fff;
  text-decoration:none; border-radius:12px; font-weight:700;
  transition:transform .12s ease, box-shadow .12s ease;
}
.unauth-link:hover{ transform:translateY(-1px); box-shadow:0 8px 16px rgba(0,0,0,.15); }
`

export default function Unauthorized() {
  return (
    <div className="unauth-scope">
      <style>{styles}</style>
      
      <div className="unauth-wrap">
        <div className="unauth-card">
          <h1 className="unauth-title">🚫 Akses Ditolak</h1>
          <p className="unauth-sub">
            Anda tidak memiliki izin untuk mengakses halaman ini. 
            Hubungi administrator jika Anda yakin ini adalah kesalahan.
          </p>
          <Link to="/" className="unauth-link">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}