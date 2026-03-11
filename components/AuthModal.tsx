"use client";
import { useState } from "react";
import { generateKey, saveKey, downloadKey, registerKey, verifyKey } from "@/lib/auth";

type Props = {
  onAuth: () => void;
};

export default function AuthModal({ onAuth }: Props) {
  const [mode, setMode] = useState<"choice" | "existing">("choice");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const key = generateKey();
      await registerKey(key);
      saveKey(key);
      downloadKey(key);
      onAuth();
    } catch {
      setError("Failed to generate key. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    if (input.trim().length < 10) {
      setError("Invalid key.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const valid = await verifyKey(input.trim());
      if (!valid) {
        setError("Key not found. Check your file or generate a new one.");
        return;
      }
      saveKey(input.trim());
      onAuth();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center px-4">
      <div className="bg-[#111] border border-emerald-900/20 rounded-xl p-6 w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-400 text-lg">⬡</span>
          <span className="font-mono text-sm text-white">
            Phantom<span className="text-emerald-400">Scrape</span>
          </span>
        </div>
        <p className="font-mono text-xs text-gray-600 mb-6">
          No account needed. Just a key.
        </p>

        {/* Choice mode */}
        {mode === "choice" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-400 text-black font-mono text-sm font-medium py-2.5 rounded-lg hover:bg-emerald-300 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Generating...</>
              ) : (
                <><span>⬡</span> Generate New Key</>
              )}
            </button>
            <button
              onClick={() => setMode("existing")}
              disabled={loading}
              className="w-full bg-transparent border border-gray-800 text-gray-400 font-mono text-sm py-2.5 rounded-lg hover:text-emerald-400 hover:border-emerald-900 disabled:opacity-60 transition-colors"
            >
              I have a key
            </button>
            {error && <p className="font-mono text-xs text-red-400">{error}</p>}
          </div>
        )}

        {/* Existing key mode */}
        {mode === "existing" && (
          <div className="flex flex-col gap-3">
            <textarea
              placeholder="Paste your key here..."
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-white placeholder-gray-700 outline-none focus:border-emerald-600 resize-none h-20 transition-colors"
            />
            {error && <p className="font-mono text-xs text-red-400">{error}</p>}
            <button
              onClick={handlePaste}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-400 text-black font-mono text-sm font-medium py-2.5 rounded-lg hover:bg-emerald-300 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verifying...</>
              ) : (
                "Enter"
              )}
            </button>
            <button
              onClick={() => { setMode("choice"); setError(""); setInput(""); }}
              disabled={loading}
              className="font-mono text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
