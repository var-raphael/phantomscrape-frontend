"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { scrapeBulk } from "@/lib/api";

const FORMATS = ["JSON", "CSV", "XML", "HTML", "TXT"];

export default function DashboardPage() {
  const [urls, setUrls] = useState<string[]>(["", ""]);
  const [throttle, setThrottle] = useState(3);
  const [format, setFormat] = useState("JSON");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const addUrl = () => setUrls((prev) => [...prev, ""]);
  const removeUrl = (i: number) => setUrls((prev) => prev.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, val: string) =>
    setUrls((prev) => prev.map((u, idx) => (idx === i ? val : u)));

  const handleScrape = async () => {
    const validUrls = urls.filter((u) => u.trim() !== "");

    if (validUrls.length === 0) {
      setError("Add at least one URL.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await scrapeBulk(validUrls, throttle, format.toLowerCase());
      localStorage.setItem("scrape_results", JSON.stringify(result));
      router.push("/data");
    } catch (err) {
      setError("Something went wrong. Check your backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header fade-up">
        <p className="page-label">// scraper</p>
        <h1 className="page-title">New Scrape Job</h1>
        <p className="page-sub">Paste URLs, set throttle, pick format. PhantomScrape handles the rest.</p>
      </div>

      <div className="dashboard-grid">
        {/* URL Inputs */}
        <section className="card fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="section-header">
            <span className="section-label">Target URLs</span>
            <button className="btn-ghost btn-sm" onClick={addUrl}>+ Add URL</button>
          </div>
          <div className="url-list">
            {urls.map((url, i) => (
              <div className="url-row" key={i}>
                <span className="url-index">{String(i + 1).padStart(2, "0")}</span>
                <input
                  className="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                />
                {urls.length > 1 && (
                  <button className="url-remove" onClick={() => removeUrl(i)}>✕</button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Config */}
        <section className="card fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="section-header">
            <span className="section-label">Configuration</span>
          </div>
          <div className="config-group">
            <label className="config-label">Throttle delay (seconds)</label>
            <div className="throttle-row">
              <input
                type="range"
                min={1}
                max={30}
                value={throttle}
                onChange={(e) => setThrottle(Number(e.target.value))}
                className="throttle-slider"
              />
              <span className="throttle-value">{throttle}s</span>
            </div>
            <p className="config-hint">Wait {throttle}s between each URL request</p>
          </div>
          <div className="config-group">
            <label className="config-label">Export Format</label>
            <div className="format-grid">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  className={`format-btn ${format === f ? "active" : ""}`}
                  onClick={() => setFormat(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* AI Info */}
        <section className="card ai-card fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="ai-header">
            <span className="ai-icon">◈</span>
            <span className="section-label">Groq AI Cleaning</span>
            <span className="tag tag-success">enabled</span>
          </div>
          <div className="ai-steps">
            {[
              "Remove noise & junk HTML",
              "Normalize fields",
              "Extract key data (title, price, date...)",
              "Summarize content",
            ].map((s, i) => (
              <div className="ai-step" key={i}>
                <span className="ai-step-dot" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="error-banner fade-up">
            <span>⚠ {error}</span>
          </div>
        )}

        {/* Submit */}
        <div className="submit-row fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="submit-info">
            <span>{urls.filter(Boolean).length} URL{urls.filter(Boolean).length !== 1 ? "s" : ""} queued</span>
            <span className="submit-sep">·</span>
            <span>{format} output</span>
            <span className="submit-sep">·</span>
            <span>{throttle}s throttle</span>
          </div>
          <button className="btn-primary" onClick={handleScrape} disabled={loading}>
            {loading ? (
              <><span className="spinner" /> Scraping...</>
            ) : (
              <><span>⬡</span> Run PhantomScrape</>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .page {
          max-width: 860px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }
        .page-header { margin-bottom: 2.5rem; }
        .page-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--accent);
          letter-spacing: 0.1em;
          margin-bottom: 0.4rem;
        }
        .page-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
        }
        .page-sub {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.2rem;
        }
        .section-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--accent);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .btn-sm { padding: 0.3rem 0.8rem; font-size: 0.75rem; }
        .url-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .url-row { display: flex; align-items: center; gap: 0.75rem; }
        .url-index {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          min-width: 24px;
        }
        .url-input {
          flex: 1;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.55rem 0.9rem;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
        }
        .url-input:focus { border-color: var(--accent); }
        .url-input::placeholder { color: var(--text-muted); }
        .url-remove {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.3rem;
          transition: color 0.2s;
        }
        .url-remove:hover { color: #ef4444; }
        .config-group { margin-bottom: 1.5rem; }
        .config-group:last-child { margin-bottom: 0; }
        .config-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          letter-spacing: 0.04em;
        }
        .throttle-row { display: flex; align-items: center; gap: 1rem; }
        .throttle-slider { flex: 1; accent-color: var(--accent); height: 4px; cursor: pointer; }
        .throttle-value {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--accent);
          min-width: 28px;
          text-align: right;
        }
        .config-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.5rem; }
        .format-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .format-btn {
          padding: 0.4rem 0.9rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
          letter-spacing: 0.06em;
          transition: all 0.2s;
        }
        .format-btn:hover { color: var(--accent); border-color: var(--border-hover); }
        .format-btn.active {
          background: var(--accent-dim);
          border-color: var(--accent);
          color: var(--accent);
        }
        .ai-card {
          border-color: rgba(16, 185, 129, 0.2);
          background: linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.04) 100%);
        }
        .ai-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.2rem; }
        .ai-icon { color: var(--accent); font-size: 1rem; }
        .ai-steps { display: flex; flex-direction: column; gap: 0.6rem; }
        .ai-step { display: flex; align-items: center; gap: 0.75rem; font-size: 0.82rem; color: var(--text-secondary); }
        .ai-step-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        .error-banner {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius);
          padding: 0.75rem 1rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: #ef4444;
        }
        .submit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .submit-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }
        .submit-sep { color: var(--text-muted); }
        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
