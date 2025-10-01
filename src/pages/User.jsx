import { useAuth } from '../contexts/AuthContext';
import { useMemo, useState } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
if (!API_BASE) console.warn('[User] VITE_API_URL belum di-set')

/* ====== Styles (inject, no Tailwind) ====== */
const styles = `
.up-scope{ --bg:#0b1020; --panel:#0f152a; --muted:#9aa8c1; --text:#e9eef6;
  --line:rgba(255,255,255,.12); --soft:rgba(255,255,255,.06); --brand:#6c9ef8; --ok:#34d399;
}
@media (prefers-color-scheme: light){
  .up-scope{ --bg:#f7f9fd; --panel:#ffffff; --text:#0b1020; --muted:#62708a; --line:#e7ebf3; --soft:#f3f6fb; }
}
*{box-sizing:border-box}
.up-wrap{ padding:24px; display:grid; gap:16px; }
.up-title{ margin:0; font-size:clamp(20px,3vw,28px); font-weight:800; }
.up-sub{ margin:0; color:var(--muted); font-size:13px; }
.up-card{ background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:16px;
  box-shadow:0 10px 24px rgba(0,0,0,.08);
}

.up-row{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.up-input{
  flex:1 1 320px; padding:12px 14px; border-radius:12px; border:1px solid var(--line);
  background:var(--soft); color:inherit; outline:none;
}
.up-btn{
  border:1px solid var(--line); background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
  color:inherit; padding:12px 14px; border-radius:12px; font-weight:700; cursor:pointer;
  transition:transform .12s ease, box-shadow .12s ease; box-shadow:0 8px 18px rgba(0,0,0,.08);
}
.up-btn:hover{ transform:translateY(-1px); box-shadow:0 12px 24px rgba(0,0,0,.12); }
.up-btn:disabled{ opacity:.6; cursor:not-allowed; }
.up-btn-primary{ background:linear-gradient(135deg, #7ba3ff 0%, #5f7aff 100%); color:#fff; border:none; }

.up-ans{ white-space:pre-wrap; line-height:1.6; }
.up-muted{ color:var(--muted); }

.up-src-list{ display:grid; gap:10px; }
.up-src-item{ border:1px solid var(--line); border-radius:12px; padding:12px; background:var(--soft); }
.up-chip{ font-size:12px; padding:2px 8px; border-radius:999px; background:var(--soft); border:1px solid var(--line); }
.up-mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.up-preview{ margin-top:10px; background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:10px; max-height:220px; overflow:auto; white-space:pre-wrap; }
.up-range{ appearance:none; width:160px; height:6px; border-radius:999px; background:var(--soft); outline:none; }
`

export default function User() {
  const { getAuthHeader } = useAuth();
  const [q, setQ] = useState('');
  const [k, setK] = useState(6); // top_k untuk retrieval
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]); // [{document_id, chunk_index, similarity, ...}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [peek, setPeek] = useState({}); // key `${docId}:${idx}` -> preview text

  const api = useMemo(() => API_BASE, []);

  function norm(str=''){ return (str || '').replace(/\s+/g,' ').trim() }

  async function ask() {
    const question = norm(q)
    if (!question) return
    if (!api) { setError('VITE_API_URL belum di-set'); return }
    setLoading(true); setError(''); setAnswer(''); setSources([]); setPeek({})

    try {
      const authHeader = getAuthHeader()
      const headers = {
        'Content-Type':'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      }
      const r = await fetch(`${api}/chat/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question, role: 'user', top_k: k })
      })
      
      if (r.status === 401) {
        window.location.href = '/login'
        return
      }
      const text = await r.text()
      const data = text ? JSON.parse(text) : {}
      if (!r.ok) throw new Error(data?.error || data?.message || `HTTP ${r.status}`)
      setAnswer(data?.answer ?? '(tidak ada jawaban)')
      setSources(Array.isArray(data?.sources) ? data.sources : [])
    } catch (e) {
      setAnswer('')
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  // enter = kirim, shift+enter = newline
  function onKeyDown(e){
    if (e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      ask()
    }
  }

  async function togglePreview(docId, idx){
    const key = `${docId}:${idx}`
    if (peek[key]) { // sudah ada → collapse
      const n = { ...peek }; delete n[key]; setPeek(n); return
    }
    try{
      const url = `${api}/documents/${docId}/chunks?limit=1&offset=${idx}`
      const r = await fetch(url)
      const j = await r.json()
      const item = j?.items?.[0]
      setPeek(p => ({ ...p, [key]: item?.content || '(chunk kosong)' }))
    }catch(e){
      setPeek(p => ({ ...p, [key]: `(gagal memuat chunk: ${e.message})` }))
    }
  }

  return (
    <div className="up-scope">
      <style>{styles}</style>

      <div className="up-wrap">
        <div>
          <h1 className="up-title">User — Tanya Materi</h1>
          <p className="up-sub">
            API: <span className="up-mono">{api || '(VITE_API_URL belum di-set)'}</span>
          </p>
        </div>

        {/* Form tanya */}
        <div className="up-card">
          <div className="up-row" style={{ alignItems:'stretch' }}>
            <textarea
              className="up-input"
              rows={3}
              value={q}
              onChange={e=>setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Tanya sesuatu… (Enter untuk kirim, Shift+Enter baris baru)"
              style={{ resize:'vertical' }}
            />
            <button className="up-btn up-btn-primary" onClick={ask} disabled={loading}>
              {loading ? 'Memproses…' : 'Tanya'}
            </button>
          </div>

          <div className="up-row" style={{ marginTop:10 }}>
            <span className="up-muted">Top-K konteks:</span>
            <input
              className="up-range"
              type="range" min={3} max={10} step={1}
              value={k} onChange={e=>setK(Number(e.target.value))}
              title={`Ambil ${k} konteks teratas dari retriever`}
            />
            <span className="up-chip">{k}</span>
          </div>
        </div>

        {/* Jawaban */}
        <div className="up-card">
          <div className="up-row" style={{ justifyContent:'space-between', marginBottom:8 }}>
            <h3 style={{ margin:0 }}>Jawaban</h3>
            {loading && <span className="up-muted">mengambil konteks & menyusun jawaban…</span>}
          </div>
          {error ? (
            <div style={{ color:'#b91c1c', background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.35)', padding:10, borderRadius:12 }}>
              {error}
            </div>
          ) : (
            <div className="up-ans">{answer || <span className="up-muted">(belum ada)</span>}</div>
          )}
        </div>

        {/* Sumber */}
        <div className="up-card">
          <div className="up-row" style={{ justifyContent:'space-between', marginBottom:8 }}>
            <h3 style={{ margin:0 }}>Sumber (konteks)</h3>
            <span className="up-chip">{sources.length} item</span>
          </div>

          {sources.length === 0 ? (
            <div className="up-muted">Belum ada sumber. Tanyakan sesuatu terlebih dahulu.</div>
          ) : (
            <div className="up-src-list">
              {sources.map((s,i)=>{
                const key = `${s.document_id}:${s.chunk_index}`
                return (
                  <div key={key} className="up-src-item">
                    <div className="up-row" style={{ justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:700, marginBottom:4 }}>[{i+1}] Doc: <span className="up-mono">{s.document_id}</span></div>
                        <div className="up-muted" style={{ fontSize:12, display:'flex', gap:12, flexWrap:'wrap' }}>
                          <span>chunk: <b>#{s.chunk_index}</b></span>
                          {'similarity' in s && <span>sim: {Number(s.similarity).toFixed(3)}</span>}
                          <span className="up-chip">id: {key}</span>
                        </div>
                      </div>

                      <div className="up-row" style={{ gap:8 }}>
                        <button className="up-btn" onClick={()=>togglePreview(s.document_id, s.chunk_index)}>
                          {peek[key] ? 'Tutup' : 'Lihat'} Chunk
                        </button>
                      </div>
                    </div>

                    {peek[key] && (
                      <div className="up-preview">
                        {peek[key]}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
