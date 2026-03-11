"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/activity", label: "Activity" },
  { href: "/data", label: "Scraped Data" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-emerald-900/20">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-mono text-sm text-white">
          <span className="text-emerald-400 text-lg">⬡</span>
          <span>Phantom<span className="text-emerald-400">Scrape</span></span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${
                  pathname === link.href
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-gray-500 hover:text-emerald-400 hover:bg-emerald-400/5"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Status + hamburger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest hidden sm:block">idle</span>
          </div>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#111] border-t border-emerald-900/20 px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded font-mono text-xs uppercase tracking-widest transition-colors ${
                pathname === link.href
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-gray-500 hover:text-emerald-400"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
