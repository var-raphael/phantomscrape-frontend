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

  const addUrl = () => setUrls((p) => [...p, ""]);
  const removeUrl = (i: number) => setUrls((p) => p.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, val: string) =>
    setUrls((p) => p.map((u, idx) => (idx === i ? val : u)));

  const handleScrape = async () => {
    const valid = urls.filter((u) => u.trim() !== "");
    if (valid.length === 0) { setError("Add at least one URL."); return; }
    setError(null);
    setLoading(true);

    // Redirect to activity immediately — don't wait for scrape to finish
    router.push("/activity");

    // Fire scrape in background
    scrapeBulk(valid, throttle, format.toLowerCase()).catch(console.error);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="font-mono text-xs text-emerald-400 tracking-widest uppercase mb-1">// scraper</p>
        <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>New Scrape Job</h1>
        <p className="text-sm text-gray-500">Paste URLs, set throttle, pick format. PhantomScrape handles the rest.</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* URLs */}
        <div className="bg-[#111] border border-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest">Target URLs</span>
            <button onClick={addUrl} className="font-mono text-xs text-gray-400 border border-gray-700 rounded px-3 py-1 hover:text-emerald-400 hover:border-emerald-800 transition-colors">
              + Add URL
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {urls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-600 w-6">{String(i + 1).padStart(2, "0")}</span>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => updateUrl(i, e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 font-mono text-sm text-white placeholder-gray-700 outline-none focus:border-emerald-600 transition-colors"
                />
                {urls.length > 1 && (
                  <button onClick={() => removeUrl(i)} className="text-gray-700 hover:text-red-400 text-xs transition-colors">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Config */}
        <div className="bg-[#111] border border-emerald-900/20 rounded-lg p-4">
          <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest block mb-4">Configuration</span>
          <div className="mb-5">
            <label className="font-mono text-xs text-gray-500 block mb-2">Throttle delay (seconds)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={1} max={30} value={throttle}
                onChange={(e) => setThrottle(Number(e.target.value))}
                className="flex-1 accent-emerald-400"
              />
              <span className="font-mono text-sm text-emerald-400 w-8 text-right">{throttle}s</span>
            </div>
            <p className="font-mono text-xs text-gray-700 mt-1">Wait {throttle}s between each request</p>
          </div>
          <div>
            <label className="font-mono text-xs text-gray-500 block mb-2">Export Format</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors ${
                    format === f
                      ? "bg-emerald-400/10 border-emerald-500 text-emerald-400"
                      : "bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-emerald-400 hover:border-emerald-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Info */}
        <div className="bg-[#111] border border-emerald-500/20 rounded-lg p-4 bg-gradient-to-br from-[#111] to-emerald-950/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-emerald-400">◈</span>
            <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest">Groq AI Cleaning</span>
            <span className="font-mono text-xs bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded">enabled</span>
          </div>
          <div className="flex flex-col gap-2">
            {["Remove noise & junk HTML", "Normalize fields", "Extract key data (title, price, date...)", "Summarize content"].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 font-mono text-xs text-red-400">
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <div className="bg-[#111] border border-emerald-900/20 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-gray-500">
            <span>{urls.filter(Boolean).length} URL{urls.filter(Boolean).length !== 1 ? "s" : ""} queued</span>
            <span className="text-gray-700">·</span>
            <span>{format} output</span>
            <span className="text-gray-700">·</span>
            <span>{throttle}s throttle</span>
          </div>
          <button
            onClick={handleScrape}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-400 text-black font-mono text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-300 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Queuing...</>
            ) : (
              <><span>⬡</span> Run PhantomScrape</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
