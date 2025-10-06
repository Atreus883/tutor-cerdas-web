import { useAuth } from '../contexts/AuthContext';
import { useMemo, useState } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
if (!API_BASE) console.warn('[User] VITE_API_URL belum di-set')

const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }

.up-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: grid;
  gap: 24px;
}

.up-header {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--line);
}

.up-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.up-sub {
  color: var(--muted);
  font-size: 14px;
  margin-top: 8px;
}

.up-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow);
  transition: box-shadow 0.3s ease;
}

.up-card:hover {
  box-shadow: 0 4px 16px var(--shadow-md);
}

.up-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.up-card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.up-input-group {
  display: grid;
  gap: 12px;
}

.up-textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--soft);
  color: var(--text);
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.up-textarea:focus {
  border-color: var(--brand);
  background: var(--panel);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.up-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
  white-space: nowrap;
}

.up-btn-primary {
  background: var(--brand);
  color: white;
  box-shadow: 0 2px 4px var(--shadow);
}

.up-btn-primary:hover:not(:disabled) {
  background: var(--brand-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-md);
}

.up-btn-secondary {
  background: var(--soft);
  color: var(--text);
  border: 1px solid var(--line);
}

.up-btn-secondary:hover:not(:disabled) {
  background: var(--line);
}

.up-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.up-slider-group {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--soft);
  border-radius: 8px;
  border: 1px solid var(--line);
}

.up-slider-label {
  font-size: 14px;
  color: var(--muted);
  font-weight: 500;
  white-space: nowrap;
}

.up-range {
  -webkit-appearance: none;
  appearance: none;
  width: 180px;
  height: 6px;
  border-radius: 999px;
  background: var(--line);
  outline: none;
  cursor: pointer;
}

.up-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand);
  cursor: pointer;
  transition: all 0.2s ease;
}

.up-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.4);
}

.up-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand);
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.up-range::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.4);
}

.up-chip {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--brand);
  color: white;
}

.up-chip-secondary {
  background: var(--soft);
  color: var(--muted);
  border: 1px solid var(--line);
}

.up-answer {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.up-empty {
  text-align: center;
  padding: 32px;
  color: var(--muted);
  font-style: italic;
}

.up-alert {
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.up-alert-danger {
  background: rgba(220, 53, 69, 0.1);
  color: var(--danger);
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.up-src-list {
  display: grid;
  gap: 16px;
}

.up-src-item {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 16px;
  background: var(--soft);
  transition: all 0.2s ease;
}

.up-src-item:hover {
  border-color: var(--brand);
  box-shadow: 0 2px 8px var(--shadow);
}

.up-src-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.up-src-info {
  flex: 1;
  min-width: 0;
}

.up-src-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 8px;
  color: var(--text);
}

.up-src-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--muted);
}

.up-src-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.up-preview {
  margin-top: 12px;
  padding: 16px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
}

.up-mono {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  background: var(--soft);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.up-loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--brand);
  font-size: 14px;
}

.up-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.up-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--brand);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

@media (max-width: 768px) {
  .up-wrap {
    padding: 24px 16px;
  }
  
  .up-card {
    padding: 16px;
  }
  
  .up-src-header {
    flex-direction: column;
  }
  
  .up-slider-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .up-range {
    width: 100%;
  }
}
`

export default function User() {
  const { getAuthHeader } = useAuth();
  const [q, setQ] = useState('');
  const [k, setK] = useState(6);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [peek, setPeek] = useState({});

  const api = useMemo(() => API_BASE, []);

  function norm(str='') { return (str || '').replace(/\s+/g,' ').trim() }

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

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ask()
    }
  }

  async function togglePreview(docId, idx) {
    const key = `${docId}:${idx}`
    if (peek[key]) {
      const n = { ...peek }; delete n[key]; setPeek(n); return
    }
    try {
      const url = `${api}/documents/${docId}/chunks?limit=1&offset=${idx}`
      const r = await fetch(url)
      const j = await r.json()
      const item = j?.items?.[0]
      setPeek(p => ({ ...p, [key]: item?.content || '(chunk kosong)' }))
    } catch(e) {
      setPeek(p => ({ ...p, [key]: `(gagal memuat chunk: ${e.message})` }))
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="up-wrap">
        {/* Header */}
        <div className="up-header">
          <h1 className="up-title">💬 Tanya Materi</h1>
          <p className="up-sub">
            Ajukan pertanyaan dan dapatkan jawaban dari knowledge base
          </p>
          <p className="up-sub">
            API Endpoint: <span className="up-mono">{api || '(belum dikonfigurasi)'}</span>
          </p>
        </div>

        {/* Form Input */}
        <div className="up-card">
          <div className="up-card-header">
            <h3 className="up-card-title">📝 Pertanyaan Anda</h3>
          </div>
          
          <div className="up-input-group">
            <textarea
              className="up-textarea"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ketik pertanyaan Anda di sini...&#10;&#10;Tips: Tekan Enter untuk mengirim, Shift+Enter untuk baris baru"
            />
            
            <div className="up-slider-group">
              <span className="up-slider-label">Jumlah Konteks (Top-K):</span>
              <input
                className="up-range"
                type="range"
                min={3}
                max={10}
                step={1}
                value={k}
                onChange={e => setK(Number(e.target.value))}
                title={`Ambil ${k} konteks teratas dari retriever`}
              />
              <span className="up-chip">{k}</span>
            </div>

            <button 
              className="up-btn up-btn-primary" 
              onClick={ask} 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? '⏳ Memproses...' : '🚀 Kirim Pertanyaan'}
            </button>
          </div>
        </div>

        {/* Jawaban */}
        <div className="up-card">
          <div className="up-card-header">
            <h3 className="up-card-title">💡 Jawaban</h3>
            {loading && (
              <div className="up-loading">
                <div className="up-spinner"></div>
                <span>Menyusun jawaban...</span>
              </div>
            )}
          </div>
          
          {error ? (
            <div className="up-alert up-alert-danger">
              ⚠️ <strong>Error:</strong> {error}
            </div>
          ) : answer ? (
            <div className="up-answer">{answer}</div>
          ) : (
            <div className="up-empty">
              Belum ada jawaban. Silakan ajukan pertanyaan terlebih dahulu.
            </div>
          )}
        </div>

        {/* Sumber */}
        <div className="up-card">
          <div className="up-card-header">
            <h3 className="up-card-title">📚 Sumber Referensi</h3>
            {sources.length > 0 && (
              <span className="up-badge">{sources.length}</span>
            )}
          </div>

          {sources.length === 0 ? (
            <div className="up-empty">
              Belum ada sumber referensi. Ajukan pertanyaan untuk melihat sumber yang digunakan.
            </div>
          ) : (
            <div className="up-src-list">
              {sources.map((s, i) => {
                const key = `${s.document_id}:${s.chunk_index}`
                return (
                  <div key={key} className="up-src-item">
                    <div className="up-src-header">
                      <div className="up-src-info">
                        <div className="up-src-title">
                          📄 [{i + 1}] Dokumen: <span className="up-mono">{s.document_id}</span>
                        </div>
                        <div className="up-src-meta">
                          <span>🔢 Chunk: <strong>#{s.chunk_index}</strong></span>
                          {'similarity' in s && (
                            <span>📊 Similarity: <strong>{Number(s.similarity).toFixed(3)}</strong></span>
                          )}
                          <span className="up-chip up-chip-secondary">{key}</span>
                        </div>
                      </div>
                      
                      <button 
                        className="up-btn up-btn-secondary"
                        onClick={() => togglePreview(s.document_id, s.chunk_index)}
                      >
                        {peek[key] ? '👁️ Tutup' : '👁️ Lihat'}
                      </button>
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
    </>
  )
}