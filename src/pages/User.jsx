import { useAuth } from "../contexts/AuthContext";
import { useMemo, useState } from "react";

const styles = `
/* ========================= */
/* BACKGROUND GRADIENT MODE  */
/* ========================= */

  .up-wrap {
  min-height: 100vh;
  padding: 32px 24px;
  display: grid;
  gap: 24px;
  transition: background 0.5s ease-in-out;
}

.up-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  gap: 24px;
}
  
/* Light Mode */
:root[data-theme="light"] .up-wrap {
  background:
    radial-gradient(1200px 600px at 10% -10%, rgba(0, 47, 255, 0.15) 0%, transparent 70%),
    radial-gradient(1000px 500px at 110% 10%, rgba(5, 144, 93, 0.15) 0%, transparent 65%),
    linear-gradient(180deg, #f8f9fa 0%, #b5c6d7ff 100%);
}


/* Dark Mode */
:root[data-theme="dark"] .up-wrap {
  background:
    radial-gradient(1200px 600px at 10% -10%, #1a2249 0%, transparent 70%),
    radial-gradient(1000px 500px at 110% 10%, #0b614d 0%, transparent 65%),
    linear-gradient(180deg, #0b1020 0%, #0a0d18 100%);
}

/* ========================= */
/* USER PAGE STYLES          */
/* ========================= */
* { box-sizing: border-box; margin: 0; padding: 0; }

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
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow);
  transition: all 0.3s ease;
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

.up-input-group { display: grid; gap: 12px; }

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
}

.up-btn-primary:hover:not(:disabled) {
  background: #5a8eeb;
  transform: translateY(-1px);
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

.up-range { width: 180px; }

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
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.up-src-list { display: grid; gap: 16px; }

.up-src-item {
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 16px;
  background: var(--soft);
}

.up-src-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.up-src-info { flex: 1; min-width: 0; }

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
  font-family: monospace;
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

@keyframes spin { to { transform: rotate(360deg); } }

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
`;

export default function User() {
  const { fetchWithAuth } = useAuth();
  const [q, setQ] = useState("");
  const [k, setK] = useState(6);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [peek, setPeek] = useState({});

  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    setPeek({});

    try {
      const data = await fetchWithAuth(`/chat/ask`, {
        method: "POST",
        body: JSON.stringify({ question: q.trim(), role: "user", top_k: k }),
      });
      setAnswer(data?.answer ?? "(tidak ada jawaban)");
      setSources(Array.isArray(data?.sources) ? data.sources : []);
    } catch (e) {
      setAnswer("");
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  }

  async function togglePreview(docId, idx) {
    const key = `${docId}:${idx}`;
    if (peek[key]) {
      const n = { ...peek };
      delete n[key];
      setPeek(n);
      return;
    }
    try {
      const j = await fetchWithAuth(`/documents/${docId}/chunks?limit=1&offset=${idx}`);
      const item = j?.items?.[0];
      setPeek((p) => ({ ...p, [key]: item?.content || "(chunk kosong)" }));
    } catch (e) {
      setPeek((p) => ({ ...p, [key]: `(gagal memuat chunk: ${e.message})` }));
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="up-wrap">
        <div className="up-header">
          <h1 className="up-title">💬 Tanya Materi</h1>
          <p className="up-sub">Ajukan pertanyaan dan dapatkan jawaban dari knowledge base</p>
        </div>

        {/* Form */}
        <div className="up-card">
          <div className="up-card-header">
            <h3 className="up-card-title">📝 Pertanyaan Anda</h3>
          </div>
          <div className="up-input-group">
            <textarea
              className="up-textarea"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ketik pertanyaan Anda di sini..."
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
                onChange={(e) => setK(Number(e.target.value))}
              />
              <span className="up-chip">{k}</span>
            </div>
            <button className="up-btn up-btn-primary" onClick={ask} disabled={loading}>
              {loading ? "⏳ Memproses..." : "🚀 Kirim Pertanyaan"}
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
            <div className="up-empty">Belum ada jawaban.</div>
          )}
        </div>

        {/* Sumber Referensi */}
        <div className="up-card">
          <div className="up-card-header">
            <h3 className="up-card-title">📚 Sumber Referensi</h3>
            {sources.length > 0 && <span className="up-badge">{sources.length}</span>}
          </div>
          {sources.length === 0 ? (
            <div className="up-empty">Belum ada sumber referensi.</div>
          ) : (
            <div className="up-src-list">
              {sources.map((s, i) => {
                const key = `${s.document_id}:${s.chunk_index}`;
                return (
                  <div key={key} className="up-src-item">
                    <div className="up-src-header">
                      <div className="up-src-info">
                        <div className="up-src-title">
                          📄 [{i + 1}] Dokumen:{" "}
                          <span className="up-mono">{s.document_id}</span>
                        </div>
                        <div className="up-src-meta">
                          <span>🔢 Chunk: <strong>#{s.chunk_index}</strong></span>
                          {"similarity" in s && (
                            <span>📊 Similarity: <strong>{Number(s.similarity).toFixed(3)}</strong></span>
                          )}
                        </div>
                      </div>
                      <button
                        className="up-btn up-btn-secondary"
                        onClick={() => togglePreview(s.document_id, s.chunk_index)}
                      >
                        {peek[key] ? "👁️ Tutup" : "👁️ Lihat"}
                      </button>
                    </div>
                    {peek[key] && <div className="up-preview">{peek[key]}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
