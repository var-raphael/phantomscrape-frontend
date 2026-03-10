"use client";
import { useState } from "react";

type Job = {
  id: string;
  url: string;
  status: "running" | "done" | "error" | "queued";
  startedAt: string;
  duration?: string;
  itemsFound?: number;
};

const MOCK_JOBS: Job[] = [
  { id: "job_01", url: "https://news.ycombinator.com", status: "running", startedAt: "Just now", itemsFound: 12 },
  { id: "job_02", url: "https://github.com/trending", status: "queued", startedAt: "Waiting..." },
  { id: "job_03", url: "https://lobste.rs", status: "done", startedAt: "2 mins ago", duration: "4.2s", itemsFound: 30 },
  { id: "job_04", url: "https://reddit.com/r/programming", status: "error", startedAt: "5 mins ago", duration: "1.1s" },
];

const statusConfig = {
  running: { label: "running", cls: "tag-pending", dot: "dot-running" },
  done: { label: "done", cls: "tag-success", dot: "dot-done" },
  error: { label: "error", cls: "tag-error", dot: "dot-error" },
  queued: { label: "queued", cls: "tag-muted", dot: "dot-queued" },
};

export default function ActivityPage() {
  const [jobs] = useState<Job[]>(MOCK_JOBS);
  const running = jobs.filter((j) => j.status === "running" || j.status === "queued").length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header fade-up">
        <p className="page-label">// activity</p>
        <h1 className="page-title">Ongoing Jobs</h1>
        <p className="page-sub">{running} job{running !== 1 ? "s" : ""} active right now.</p>
      </div>

      {/* Stats row */}
      <div className="stats-row fade-up" style={{ animationDelay: "0.1s" }}>
        {[
          { label: "Total Jobs", value: jobs.length },
          { label: "Running", value: jobs.filter(j => j.status === "running").length },
          { label: "Completed", value: jobs.filter(j => j.status === "done").length },
          { label: "Failed", value: jobs.filter(j => j.status === "error").length },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Job list */}
      <div className="job-list fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="list-header">
          <span>URL</span>
          <span>Status</span>
          <span>Started</span>
          <span>Items</span>
          <span>Duration</span>
        </div>
        {jobs.map((job, i) => {
          const cfg = statusConfig[job.status];
          return (
            <div className="job-row" key={job.id} style={{ animationDelay: `${0.25 + i * 0.07}s` }}>
              <div className="job-url">
                <span className={`job-dot ${cfg.dot}`} />
                <span className="url-text">{job.url}</span>
              </div>
              <span className={`tag ${cfg.cls}`}>{cfg.label}</span>
              <span className="job-meta">{job.startedAt}</span>
              <span className="job-meta">{job.itemsFound ?? "—"}</span>
              <span className="job-meta">{job.duration ?? "—"}</span>
            </div>
          );
        })}
      </div>

      {/* Live terminal log */}
      <div className="terminal-card card fade-up" style={{ animationDelay: "0.45s" }}>
        <div className="terminal-header">
          <span className="terminal-label">◈ live log</span>
          <span className="tag tag-pending">streaming</span>
        </div>
        <div className="terminal-body">
          <p><span className="log-time">00:00:01</span> <span className="log-info">[INFO]</span> Starting job_01 → https://news.ycombinator.com</p>
          <p><span className="log-time">00:00:01</span> <span className="log-info">[INFO]</span> Detected static site — using BeautifulSoup</p>
          <p><span className="log-time">00:00:02</span> <span className="log-info">[INFO]</span> Fetched 92kb of HTML</p>
          <p><span className="log-time">00:00:03</span> <span className="log-success">[AI]</span> Groq cleaning started...</p>
          <p><span className="log-time">00:00:04</span> <span className="log-success">[AI]</span> Extracted 12 items — noise removed</p>
          <p className="log-blink"><span className="log-time">00:00:04</span> <span className="log-info">[INFO]</span> Throttling 3s before next URL<span className="cursor">▋</span></p>
        </div>
      </div>

      <style jsx>{`
        .page {
          max-width: 860px;
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
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        .stat-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .job-list {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .list-header {
          display: grid;
          grid-template-columns: 1fr 90px 110px 70px 90px;
          padding: 0.7rem 1.25rem;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .job-row {
          display: grid;
          grid-template-columns: 1fr 90px 110px 70px 90px;
          align-items: center;
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
        .job-row:last-child { border-bottom: none; }
        .job-row:hover { background: var(--bg-elevated); }
        .job-url {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
        }
        .job-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-running { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; animation: pulse 1.5s infinite; }
        .dot-done { background: #10b981; }
        .dot-error { background: #ef4444; }
        .dot-queued { background: #4b5563; }
        .url-text {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .job-meta {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .tag-muted {
          background: rgba(75, 85, 99, 0.2);
          color: #6b7280;
        }
        .terminal-card {
          border-color: rgba(16, 185, 129, 0.15);
        }
        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .terminal-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--accent);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .terminal-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.78rem;
          line-height: 1.7;
        }
        .log-time { color: var(--text-muted); margin-right: 0.5rem; }
        .log-info { color: #6b7280; }
        .log-success { color: var(--accent); }
        .cursor {
          animation: blink 1s step-end infinite;
          color: var(--accent);
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
