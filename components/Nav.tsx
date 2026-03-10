"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/activity", label: "Activity" },
  { href: "/data", label: "Scraped Data" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="nav-brand">
        <span className="brand-icon">⬡</span>
        <span className="brand-name">Phantom<span className="brand-accent">Scrape</span></span>
      </div>
      <ul className="nav-links">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`nav-link ${pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-status">
        <span className="status-dot" />
        <span className="status-text">idle</span>
      </div>

      <style jsx>{`
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 60px;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.12);
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'DM Mono', monospace;
          font-size: 1rem;
          color: #f0fdf4;
          letter-spacing: -0.02em;
        }
        .brand-icon {
          color: #10b981;
          font-size: 1.2rem;
        }
        .brand-accent {
          color: #10b981;
        }
        .nav-links {
          display: flex;
          list-style: none;
          gap: 0.25rem;
          margin: 0;
          padding: 0;
        }
        .nav-link {
          display: block;
          padding: 0.4rem 0.9rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          color: #6b7280;
          text-decoration: none;
          border-radius: 4px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: color 0.2s, background 0.2s;
        }
        .nav-link:hover {
          color: #10b981;
          background: rgba(16, 185, 129, 0.06);
        }
        .nav-link.active {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        .nav-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: pulse 2s infinite;
        }
        .status-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          color: #10b981;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </nav>
  );
}
