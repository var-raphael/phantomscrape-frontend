"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const FORMATS = ["JSON", "CSV", "XML", "HTML", "TXT"];
const FILTERS = ["All", "JSON", "CSV", "XML", "HTML", "TXT"];

type Result = {
  id: string;
  job_id: string;
  url: string;
  title: string;
  links: string[];
  cleaned: string;
  success: boolean;
  created_at: string;
};

type Job = {
  id: string;
  format: string;
};

export default function DataPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [selected, setSelected] = useState<Result | null>(null);
  const [exportFormat, setExportFormat] = useState("JSON");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: jobData } = await supabase.from("jobs").select("id, format");
    if (jobData) {
      const jobMap: Record<string, Job> = {};
      jobData.forEach((j) => { jobMap[j.id] = j; });
      setJobs(jobMap);
    }
    const { data: resultData } = await supabase
      .from("results")
      .select("*")
      .eq("success", true)
      .order("created_at", { ascending: false });
    if (resultData) setResults(resultData);
    setLoading(false);
  };

  const handleDelete = async (result: Result, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(result.id);
    await supabase.from("results").delete().eq("id", result.id);
    setResults((prev) => prev.filter((r) => r.id !== result.id));
    if (selected?.id === result.id) setSelected(null);
    setDeleting(null);
  };

  const handleDownload = (result: Result) => {
    const data = { url: result.url, title: result.title, links: result.links, cleaned: result.cleaned };
    let content = "", mime = "application/json", ext = "json";
    if (exportFormat === "JSON") { content = JSON.stringify(data, null, 2); }
    else if (exportFormat === "CSV") { content = `url,title,cleaned\n"${data.url}","${data.title}","${data.cleaned}"`; mime = "text/csv"; ext = "csv"; }
    else if (exportFormat === "TXT") { content = `URL: ${data.url}\nTitle: ${data.title}\nCleaned: ${data.cleaned}`; mime = "text/plain"; ext = "txt"; }
    else if (exportFormat === "XML") { content = `<r><url>${data.url}</url><title>${data.title}</title><cleaned>${data.cleaned}</cleaned></r>`; mime = "application/xml"; ext = "xml"; }
    else if (exportFormat === "HTML") { content = `<table><tr><td><b>URL</b></td><td>${data.url}</td></tr><tr><td><b>Title</b></td><td>${data.title}</td></tr><tr><td><b>Cleaned</b></td><td>${data.cleaned}</td></tr></table>`; mime = "text/html"; ext = "html"; }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `phantomscrape-${result.id}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = results.filter((r) => {
    const matchSearch = r.url.toLowerCase().includes(search.toLowerCase()) ||
      (r.title && r.title.toLowerCase().includes(search.toLowerCase()));
    const jobFormat = jobs[r.job_id]?.format?.toUpperCase() ?? "";
    const matchFilter = filter === "All" || jobFormat === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="font-mono text-xs text-emerald-400 tracking-widest uppercase mb-1">// data</p>
        <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Scraped Data</h1>
        <p className="text-sm text-gray-500">{results.length} URL{results.length !== 1 ? "s" : ""} stored.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Left panel */}
        <div className="bg-[#111] border border-emerald-900/20 rounded-lg overflow-hidden h-fit">
          {/* Search + Filter */}
          <div className="p-3 border-b border-emerald-900/20 flex gap-2">
            <input
              type="text"
              placeholder="Search URL or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-gray-800 rounded px-3 py-2 font-mono text-xs text-white placeholder-gray-700 outline-none focus:border-emerald-600 transition-colors"
            />
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`font-mono text-xs px-3 py-2 rounded border transition-colors ${
                  filter !== "All"
                    ? "bg-emerald-400/10 border-emerald-600 text-emerald-400"
                    : "bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-emerald-400 hover:border-emerald-900"
                }`}
              >
                ⊟ {filter}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-1 bg-[#161616] border border-emerald-900/20 rounded-lg overflow-hidden z-10 w-28">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 font-mono text-xs transition-colors ${
                        filter === f ? "text-emerald-400 bg-emerald-400/10" : "text-gray-500 hover:text-emerald-400 hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Result rows */}
          <div className="flex flex-col max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="font-mono text-xs text-gray-600 text-center py-8">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="font-mono text-xs text-gray-600 text-center py-8">No results found.</p>
            ) : (
              filtered.map((result) => (
                <div
                  key={result.id}
                  onClick={() => setSelected(result)}
                  className={`px-4 py-3 border-b border-emerald-900/10 last:border-0 cursor-pointer transition-colors ${
                    selected?.id === result.id
                      ? "bg-emerald-400/10 border-l-2 border-l-emerald-400"
                      : "hover:bg-[#161616]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-mono text-xs text-white truncate max-w-[160px]">
                      {result.url.replace("https://", "")}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {jobs[result.job_id] && (
                        <span className="font-mono text-[10px] bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded">
                          {jobs[result.job_id].format.toUpperCase()}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(result, e)}
                        disabled={deleting === result.id}
                        className="font-mono text-[10px] text-gray-600 hover:text-red-400 border border-gray-800 hover:border-red-900 px-1.5 py-0.5 rounded transition-colors disabled:opacity-40"
                      >
                        {deleting === result.id ? "..." : "✕"}
                      </button>
                    </div>
                  </div>
                  {result.title && (
                    <p className="font-mono text-[10px] text-gray-500 truncate">{result.title}</p>
                  )}
                  <p className="font-mono text-[10px] text-gray-700 mt-0.5">
                    {new Date(result.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: preview */}
        <div className="bg-[#111] border border-emerald-900/20 rounded-lg p-4 min-h-[400px]">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-700">
              <span className="text-4xl">⬡</span>
              <p className="font-mono text-xs">Select a URL to preview</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1">Preview</p>
                <p className="font-mono text-xs text-gray-500 truncate">{selected.url}</p>
              </div>

              {selected.title && (
                <p className="text-base font-bold text-white mb-3" style={{ fontFamily: "Syne, sans-serif" }}>{selected.title}</p>
              )}

              <div className="bg-[#1a1a1a] border border-gray-800 rounded p-3 max-h-48 overflow-y-auto mb-4">
                <pre className="font-mono text-xs text-gray-500 whitespace-pre-wrap">{selected.cleaned}</pre>
              </div>

              {selected.links?.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-xs text-gray-600 uppercase tracking-widest mb-2">Links ({selected.links.length})</p>
                  <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                    {selected.links.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noreferrer" className="font-mono text-xs text-emerald-400/70 hover:text-emerald-400 truncate transition-colors">
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Export */}
              <div>
                <p className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-3">Export As</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {FORMATS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setExportFormat(f)}
                        className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors ${
                          exportFormat === f
                            ? "bg-emerald-400/10 border-emerald-500 text-emerald-400"
                            : "bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-emerald-400 hover:border-emerald-900"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDownload(selected)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-400 text-black font-mono text-xs font-medium px-4 py-2 rounded-lg hover:bg-emerald-300 transition-colors"
                  >
                    ↓ Download {exportFormat}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
