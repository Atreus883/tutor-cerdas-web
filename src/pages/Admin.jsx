import { useEffect, useMemo, useState, useMemo as useM } from "react";
import { useAuth } from "../contexts/AuthContext";
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
if (!API_BASE) console.warn("[Admin] VITE_API_URL belum di-set");

/* ====== Styles (inject) ====== */
const styles = `
.ad-scope{ --bg:#0b1020; --panel:#0f152a; --muted:#9aa8c1; --text:#e9eef6;
  --line:rgba(255,255,255,.12); --soft:rgba(255,255,255,.06);
  --brand:#6c9ef8; --ok:#34d399; --warn:#f59e0b; --err:#ef4444;
}
@media (prefers-color-scheme: light){
  .ad-scope{ --bg:#f7f9fd; --panel:#ffffff; --text:#0b1020; --muted:#62708a; --line:#e7ebf3; --soft:#f3f6fb; }
}
*{box-sizing:border-box}

.ad-wrap{ padding:24px; }
.ad-h1{ margin:0 0 6px; font-size:clamp(20px,3vw,28px); font-weight:800; }
.ad-sub{ margin:0 0 18px; color:var(--muted); font-size:14px; }

.ad-grid{ display:grid; gap:16px; grid-template-columns: 1fr; }
@media (min-width:960px){ .ad-grid{ grid-template-columns: 420px 1fr; } }

.ad-card{ background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:16px;
  box-shadow:0 10px 24px rgba(0,0,0,.08);
}

.ad-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.ad-mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

.ad-input{ width:100%; padding:10px 12px; border-radius:10px;
  border:1px solid var(--line); background:var(--soft); color:inherit; outline:none;
}
.ad-input::placeholder{ color:var(--muted); }

.ad-btn{
  border:1px solid var(--line); background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
  color:inherit; padding:10px 14px; border-radius:12px; font-weight:700; cursor:pointer;
  transition:transform .12s ease, box-shadow .12s ease, filter .12s ease; box-shadow:0 8px 18px rgba(0,0,0,.08);
}
.ad-btn:hover{ transform:translateY(-1px); box-shadow:0 12px 24px rgba(0,0,0,.12); }
.ad-btn:disabled{ opacity:.6; cursor:not-allowed; }

.ad-btn-primary{ background:linear-gradient(135deg, #7ba3ff 0%, #5f7aff 100%); color:#fff; border:none; }
.ad-btn-ghost{ background:var(--soft); }
.ad-btn-danger{ background:linear-gradient(135deg, #ff7a7a 0%, #ef4444 100%); color:#fff; border:none; }

.ad-badge{ display:inline-flex; align-items:center; gap:8px; font-size:12px; padding:4px 10px; border-radius:999px; border:1px solid var(--line); }
.ad-badge.ok{ background:rgba(52,211,153,.12); color:#10b981; border-color:rgba(16,185,129,.25);}
.ad-badge.idx{ background:rgba(245,158,11,.12); color:#d97706; border-color:rgba(217,119,6,.25);}
.ad-badge.up{ background:rgba(108,158,248,.12); color:#4f74ff; border-color:rgba(99,102,241,.25);}
.ad-badge.err{ background:rgba(239,68,68,.12); color:#ef4444; border-color:rgba(239,68,68,.25);}

.ad-drop{
  margin-top:8px; padding:18px; border:1.5px dashed var(--line); border-radius:12px; background:var(--soft);
  text-align:center; color:var(--muted); transition:border-color .15s ease, background .15s ease;
}
.ad-drop.drag{ border-color:var(--brand); background:rgba(108,158,248,.08); color:inherit; }

.ad-list{ display:grid; gap:12px; }
.ad-item{ list-style:none; padding:14px; border:1px solid var(--line); border-radius:12px; background:var(--panel); }
.ad-title{ font-weight:700; margin:0 0 4px; word-break:break-word; }
.ad-meta{ color:var(--muted); font-size:12px; display:flex; gap:10px; flex-wrap:wrap; }

.ad-tools{ display:flex; gap:8px; flex-wrap:wrap; }
.ad-chunks{ margin-top:10px; background:var(--soft); border:1px solid var(--line); border-radius:12px; padding:12px; max-height:360px; overflow:auto; }
.ad-chunks ol{ padding-left:18px; }
.ad-chip{ font-size:12px; padding:2px 8px; border-radius:999px; background:var(--soft); border:1px solid var(--line); }

.ad-alert{ background:rgba(239,68,68,.12); color:#b91c1c; border:1px solid rgba(239,68,68,.35); padding:10px; border-radius:12px; }
`;

export default function Admin() {
  const { getAuthHeader } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rebuildId, setRebuildId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState(false);

  const api = useMemo(() => API_BASE, []);

  async function fetchJSON(path, opts = {}) {
    const authHeader = getAuthHeader();
    const headers = {
      ...(opts.headers || {}),
      ...(authHeader ? { Authorization: authHeader } : {}),
    };

    const r = await fetch(`${api}${path}`, {
      headers,
      ...opts,
    });

    // Handle auth errors
    if (r.status === 401) {
      window.location.href = "/login";
      return;
    }

    const text = await r.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text };
    }
    if (!r.ok) {
      const msg =
        body?.error || body?.message || body?.raw || `HTTP ${r.status}`;
      throw new Error(msg);
    }
    return body;
  }

  async function refresh() {
    try {
      setLoading(true);
      setErrorMsg("");
      const j = await fetchJSON(`/documents`);
      setItems(j.items || []);
    } catch (e) {
      setErrorMsg(String(e.message || e));
      console.error("[Admin] refresh:", e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function upload() {
    if (!file) return alert("Pilih PDF dulu");
    try {
      setUploading(true);
      setErrorMsg("");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title || file.name);

      const authHeader = getAuthHeader();
      const headers = authHeader ? { Authorization: authHeader } : {};

      const r = await fetch(`${api}/documents/upload`, { 
        method: "POST", 
        body: fd,
        headers
      });

      if (r.status === 401) {
        window.location.href = '/login'
        return
      }

      const text = await r.text();
      let j;

      try {
        j = JSON.parse(text);
      } catch {
        j = { raw: text };
      }
      
      if (!r.ok || !j.ok) throw new Error(j.error || j.raw || "Upload gagal");
      setFile(null);
      setTitle("");
      await refresh();

    } catch (e) {
      alert(e.message || String(e));
      setErrorMsg(String(e.message || e));
    } finally {
      setUploading(false);
    }
  }

  async function rebuild(id) {
    try {
      setRebuildId(id);
      setErrorMsg("");

      // Panggil backend API untuk memulai proses rebuild di latar belakang
      const j = await fetchJSON(`/documents/rebuild/${id}`, { method: "POST" });

      // Tampilkan pesan sukses yang sesuai dengan proses asynchronous
      if (j.ok) {
        alert(j.message || "Rebuild process has started successfully!");

        // Beri jeda 2 detik, lalu refresh daftar dokumen untuk melihat
        // perubahan status dari 'uploaded' menjadi 'processing'.
        setTimeout(() => {
          refresh();
        }, 2000);
      } else {
        // Jika ada pesan error dari server, tampilkan
        throw new Error(j.error || "Failed to start rebuild process.");
      }
    } catch (e) {
      alert(`Rebuild failed: ${e.message || String(e)}`);
      setErrorMsg(String(e.message || e));
    } finally {
      // Pastikan state loading di-reset setelah beberapa saat,
      // bukan setelah proses selesai.
      setTimeout(() => setRebuildId(null), 1000);
    }
  }

  async function viewChunks(id) {
    try {
      setViewDoc(id);
      setChunks([]);
      const j = await fetchJSON(`/documents/${id}/chunks?limit=200`);
      setChunks(j.items || []);
    } catch (e) {
      setErrorMsg(String(e.message || e));
      console.error("[Admin] viewChunks:", e);
    }
  }

  function statusBadge(status) {
    const s = (status || "").toLowerCase();
    if (s === "embedded") return <span className="ad-badge ok">embedded</span>;
    if (s === "indexed") return <span className="ad-badge idx">indexed</span>;
    if (s === "uploaded") return <span className="ad-badge up">uploaded</span>;
    if (s === "error") return <span className="ad-badge err">error</span>;
    return <span className="ad-badge">{status || "unknown"}</span>;
  }

  const filtered = useM(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter(
      (x) =>
        (x.title || "").toLowerCase().includes(qq) ||
        (x.storage_path || "").toLowerCase().includes(qq) ||
        (x.id || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="ad-scope">
      <style>{styles}</style>

      <div className="ad-wrap">
        <h1 className="ad-h1">Admin — Documents</h1>
        <p className="ad-sub">
          API:{" "}
          <span className="ad-mono">
            {api || "(VITE_API_URL belum di-set)"}
          </span>
        </p>

        {errorMsg && <div className="ad-alert">{errorMsg}</div>}

        <div className="ad-grid">
          {/* === Uploader / Controls === */}
          <div className="ad-card">
            <div style={{ display: "grid", gap: 10 }}>
              <label
                htmlFor="title"
                style={{ fontSize: 13, color: "var(--muted)" }}
              >
                Judul (opsional)
              </label>
              <input
                id="title"
                className="ad-input"
                placeholder="Judul (opsional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label
                htmlFor="pdf"
                style={{ fontSize: 13, color: "var(--muted)" }}
              >
                File PDF
              </label>
              <input
                id="pdf"
                name="file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <div
                className={`ad-drop ${drag ? "drag" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
              >
                {file ? (
                  <>
                    Dipilih: <b>{file.name}</b>
                  </>
                ) : (
                  <>
                    Tarik & letakkan PDF di sini, atau pilih lewat input di atas
                  </>
                )}
              </div>

              <div className="ad-row">
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="ad-btn ad-btn-primary"
                    onClick={upload}
                    disabled={uploading || !file}
                    aria-busy={uploading}
                  >
                    {uploading ? "Uploading…" : "Upload PDF"}
                  </button>
                  <button
                    className="ad-btn ad-btn-ghost"
                    onClick={refresh}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
                <input
                  className="ad-input"
                  placeholder="Cari dokumen…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ maxWidth: 180 }}
                />
              </div>
            </div>
          </div>

          {/* === List Dokumen === */}
          <div className="ad-card">
            <div className="ad-row" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Daftar Dokumen</h3>
              <span className="ad-chip">{filtered.length} item</span>
            </div>

            <ul className="ad-list">
              {filtered.map((x) => (
                <li key={x.id} className="ad-item">
                  <div className="ad-row" style={{ alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="ad-title">
                        {x.title || x.storage_path || x.file_path}
                      </div>
                      <div className="ad-meta">
                        <span>
                          ID: <span className="ad-mono">{x.id}</span>
                        </span>
                        <span>pages: {x.pages ?? "-"}</span>
                        <span>size: {x.size ? `${x.size} B` : "-"}</span>
                        {statusBadge(x.status)}
                      </div>
                    </div>

                    <div className="ad-tools">
                      <button
                        className="ad-btn"
                        onClick={() => viewChunks(x.id)}
                      >
                        Lihat Chunks
                      </button>
                      <button
                        className="ad-btn"
                        onClick={() => rebuild(x.id)}
                        disabled={!!rebuildId}
                        aria-busy={rebuildId === x.id}
                        title="Extract → Chunk → Embed"
                      >
                        {rebuildId === x.id ? "Rebuilding…" : "Rebuild"}
                      </button>
                    </div>
                  </div>

                  {viewDoc === x.id && (
                    <div className="ad-chunks">
                      {chunks.length === 0 ? (
                        <div style={{ color: "var(--muted)" }}>
                          Belum ada chunks.
                        </div>
                      ) : (
                        <ol>
                          {chunks.map((c) => (
                            <li key={c.id} style={{ marginBottom: 12 }}>
                              <div
                                style={{ fontSize: 12, color: "var(--muted)" }}
                              >
                                #{c.chunk_index}
                              </div>
                              <pre
                                style={{ whiteSpace: "pre-wrap", margin: 0 }}
                              >
                                {c.content}
                              </pre>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
