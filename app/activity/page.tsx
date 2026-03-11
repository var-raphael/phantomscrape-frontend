"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Result = {
  id: string;
  job_id: string;
  url: string;
  title: string | null;
  status: string;
  success: boolean;
  created_at: string;
  format?: string;
};

type Job = {
  id: string;
  urls: string[];
  format: string;
  status: string;
  created_at: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  queued:    { label: "queued",   color: "text-gray-400",    bg: "bg-gray-500/10",    dot: "bg-gray-500" },
  scraping:  { label: "scraping", color: "text-yellow-400",  bg: "bg-yellow-400/10",  dot: "bg-yellow-400" },
  completed: { label: "done",     color: "text-emerald-400", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
  failed:    { label: "failed",   color: "text-red-400",     bg: "bg-red-400/10",     dot: "bg-red-400" },
};

export default function ActivityPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const fetchAll = async () => {
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (jobData) {
      const jobMap: Record<string, Job> = {};
      jobData.forEach((j) => { jobMap[j.id] = j; });
      setJobs(jobMap);
    }

    const { data: resultData } = await supabase
      .from("results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (resultData) {
      setResults(resultData);
      setLoading(false);
    }
  };

  const handleDelete = async (resultId: string, jobId: string) => {
    setDeleting(resultId);
    // Check if this is the last result for the job
    const jobResults = results.filter((r) => r.job_id === jobId);
    if (jobResults.length === 1) {
      // Delete the whole job (cascade deletes results)
      await supabase.from("jobs").delete().eq("id", jobId);
      setJobs((prev) => { const copy = { ...prev }; delete copy[jobId]; return copy; });
    } else {
      await supabase.from("results").delete().eq("id", resultId);
    }
    setResults((prev) => prev.filter((r) => r.id !== resultId));
    setDeleting(null);
  };

  const queued = results.filter((r) => r.status === "queued").length;
  const scraping = results.filter((r) => r.status === "scraping").length;
  const active = queued + scraping;

  const stats = [
    { label: "Total URLs", value: results.length },
    { label: "Completed", value: results.filter((r) => r.status === "completed").length },
    { label: "Active", value: active },
    { label: "Failed", value: results.filter((r) => r.status === "failed").length },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-xs text-emerald-400 tracking-widest uppercase mb-1">// activity</p>
        <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Ongoing Jobs</h1>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="font-mono text-xs text-gray-500">polling every 3s</p>
        </div>
      </div>

      {/* Queue banner */}
      {active > 0 && (
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="font-mono text-xs text-yellow-400">
              {scraping > 0 && `${scraping} scraping`}
              {scraping > 0 && queued > 0 && " · "}
              {queued > 0 && `${queued} queued`}
            </span>
          </div>
          <span className="font-mono text-xs text-yellow-400/60">in progress</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#111] border border-emerald-900/20 rounded-lg p-3">
            <p className="text-2xl font-black text-white" style={{ fontFamily: "Syne, sans-serif" }}>{s.value}</p>
            <p className="font-mono text-xs text-gray-600 uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-URL cards */}
      {loading ? (
        <p className="font-mono text-xs text-gray-600 text-center py-8">Loading...</p>
      ) : results.length === 0 ? (
        <p className="font-mono text-xs text-gray-600 text-center py-8">No jobs yet. Run a scrape first.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((result) => {
            const cfg = statusConfig[result.status] ?? statusConfig.queued;
            const job = jobs[result.job_id];

            return (
              <div
                key={result.id}
                className={`bg-[#111] border rounded-lg px-4 py-3 flex items-center justify-between gap-3 ${
                  result.status === "scraping" ? "border-yellow-400/20" : "border-emerald-900/20"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${result.status === "scraping" ? "animate-pulse" : ""}`} />
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-white truncate max-w-[220px]">
                      {result.url.replace("https://", "")}
                    </p>
                    {result.title && (
                      <p className="font-mono text-[10px] text-gray-600 truncate max-w-[220px] mt-0.5">{result.title}</p>
                    )}
                    <p className="font-mono text-[10px] text-gray-700 mt-0.5">
                      {new Date(result.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {job && ` · ${job.format.toUpperCase()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <button
                    onClick={() => handleDelete(result.id, result.job_id)}
                    disabled={deleting === result.id}
                    className="font-mono text-[10px] text-gray-600 hover:text-red-400 border border-gray-800 hover:border-red-900 px-2 py-0.5 rounded transition-colors disabled:opacity-40"
                  >
                    {deleting === result.id ? "..." : "✕"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={fetchAll}
        className="mt-6 w-full font-mono text-xs text-gray-600 border border-gray-800 rounded-lg py-2 hover:text-emerald-400 hover:border-emerald-900 transition-colors"
      >
        ↻ Refresh Now
      </button>
    </div>
  );
}
