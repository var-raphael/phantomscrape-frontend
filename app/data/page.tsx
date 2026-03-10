"use client";
import { useState } from "react";

const FORMATS = ["JSON", "CSV", "XML", "HTML", "TXT"];

type Result = {
  id: string;
  url: string;
  scrapedAt: string;
  items: number;
  format: string;
  summary: string;
};

const MOCK_RESULTS: Result[] = [
  { id: "r_01", url: "https://news.ycombinator.com", scrapedAt: "Today, 14:02", items: 30, format: "JSON", summary: "Top HN stories — titles, scores, authors, comment counts extracted and normalized." },
  { id: "r_02", url: "https://lobste.rs", scrapedAt: "Today, 13:48", items: 25, format: "CSV", summary: "Tech news links with tags, upvote counts, and submission timestamps." },
  { id: "r_03", url: "https://github.com/trending", scrapedAt: "Yesterday, 09:15", items: 20, format: "JSON", summary: "Trending repos — name, stars, language, description cleaned and structured." },
];

export default function DataPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState("JSON");
  const [search, setSearch] = useState("");

  const filtered = MOCK_RESULTS.filter((r) =>
    r.url.toLowerCase().includes(search.toLowerCase()) ||
    r.summary.toLowerCase().includes(search.toLowerCase())
  );

  const selectedResult = MOCK_RESULTS.find((r) => r.id === selected);

  return (
    <div className="page">
      <div className="page-header fade-up">
        <p className="page-label">// data</p>
        <h1 className="page-title">Scraped Data</h1>
        <p className="page-sub">{MOCK_RESULTS.length} sessions stored. Select one to preview and export.</p>
      </div>

      <div className="data-layout">
        {/* Left: result list */}
        <div className="results-panel fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="search-row">
            <input
              className="search-input"
              type="text"
              placeholder="Search results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="result-list">
            {filtered.map((r, i) => (
              <div
                key={r.id}
                className={`result-item ${selected === r.id ? "active" : ""}`}
                onClick={() => setSelected(r.id)}
                style={{ animationDelay: `${0.15 + i * 0.07}s` }}
              >
                <div className="result-top">
                  <span className="result-url">{r.url.replace("https://", "")}</span>
                  <span className={`tag tag-success`}>{r.format}</span>
                </div>
                <p className="result-summary">{r.summary}</p>
                <div className="result-meta">
                  <span>{r.scrapedAt}</span>
                  <span>·</span>
                  <span>{r.items} items</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="empty-state">No results match your search.</p>
            )}
          </div>
        </div>

        {/* Right: preview + export */}
        <div className="preview-panel fade-up" style={{ animationDelay: "0.2s" }}>
          {selectedResult ? (
            <>
              <div className="preview-header">
                <div>
                  <p className="section-label">Preview</p>
                  <p className="preview-url">{selectedResult.url}</p>
                </div>
                <span className="tag tag-success">{selectedResult.items} items</span>
              </div>

              {/* Mock JSON preview */}
              <div className="code-block">
                <pre>{`[
  {
    "title": "Ask HN: How do you stay focused?",
    "score": 342,
    "author": "throwaway_dev",
    "comments": 198,
    "url": "https://news.ycombinator.com/item?id=..."
  },
  {
    "title": "Show HN: I built a scraper in Go",
    "score": 211,
    "author": "gopher42",
    "comments": 87,
    "url": "https://news.ycombinator.com/item?id=..."
  }
  // ... ${selectedResult.items - 2} more items
]`}</pre>
              </div>

              {/* AI Summary */}
              <div className="ai-summary">
                <span className="ai-summary-label">◈ AI Summary</span>
                <p>{selectedResult.summary}</p>
              </div>

              {/* Export */}
              <div className="export-section">
                <p className="section-label">Export As</p>
                <div className="export-row">
                  <div className="format-grid">
                    {FORMATS.map((f) => (
                      <button
                        key={f}
                        className={`format-btn ${exportFormat === f ? "active" : ""}`}
                        onClick={() => setExportFormat(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary">
                    ↓ Download {exportFormat}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-preview">
              <span className="empty-icon">⬡</span>
              <p>Select a result to preview and export</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .page {
          max-width: 1050px;
          margin: 0 auto;
          padding: 3rem 1.5rem 4rem;
        }
        .page-header { margin-bottom: 2rem; }
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
        }
        .data-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .results-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .search-row {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
        }
        .search-input {
          width: 100%;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.5rem 0.8rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: var(--accent); }
        .search-input::placeholder { color: var(--text-muted); }
        .result-list {
          display: flex;
          flex-direction: column;
        }
        .result-item {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.15s;
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
        .result-item:last-child { border-bottom: none; }
        .result-item:hover { background: var(--bg-elevated); }
        .result-item.active {
          background: var(--accent-dim);
          border-left: 2px solid var(--accent);
        }
        .result-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.4rem;
        }
        .result-url {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        .result-summary {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .result-meta {
          display: flex;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .empty-state {
          padding: 2rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .preview-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          min-height: 400px;
        }
        .preview-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .section-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--accent);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 0.3rem;
        }
        .preview-url {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .code-block {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
          overflow-x: auto;
        }
        .code-block pre {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          color: var(--text-secondary);
          line-height: 1.7;
          white-space: pre;
        }
        .ai-summary {
          background: linear-gradient(135deg, var(--bg-elevated), rgba(16,185,129,0.04));
          border: 1px solid rgba(16,185,129,0.15);
          border-radius: 6px;
          padding: 0.9rem 1rem;
          margin-bottom: 1.25rem;
        }
        .ai-summary-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }
        .ai-summary p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .export-section { margin-top: 1rem; }
        .export-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }
        .format-grid {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .format-btn {
          padding: 0.35rem 0.8rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
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
        .empty-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          gap: 1rem;
          color: var(--text-muted);
        }
        .empty-icon {
          font-size: 2.5rem;
          color: rgba(16,185,129,0.2);
        }
        .empty-preview p {
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}
