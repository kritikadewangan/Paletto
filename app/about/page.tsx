"use client";

import { useState, useRef, useEffect } from "react";

type PaletteItem = {
  id: string;
  text: string;
  colors: string[];
  likesCount?: number;
};

type ApiResponse = {
  items: PaletteItem[];
  total?: number;
};

function toHex(c: string) {
  return c.startsWith("#") ? c : `#${c}`;
}

function getTextColor(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#111" : "#fff";
}

const SUGGESTIONS = [
  { label: "🌅 Sunset", value: "sunset" },
  { label: "🌲 Forest", value: "forest" },
  { label: "🌊 Ocean", value: "ocean" },
  { label: "🌃 Neon City", value: "neon city" },
  { label: "📷 Vintage", value: "vintage" },
  { label: "🌸 Pastel", value: "pastel spring" },
  { label: "📚 Dark Academia", value: "dark academia" },
  { label: "🏜️ Desert", value: "desert" },
];

function PaletteCard({ palette, index }: { palette: PaletteItem; index: number }) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 55);
    return () => clearTimeout(t);
  }, [index]);

  function copy(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1400);
  }

  return (
    <div
      className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-shadow duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Color Strip */}
      <div className="flex h-40 relative">
        {palette.colors.map((rawColor, i) => {
          const hex = toHex(rawColor);
          const isHov = hoveredIdx === i;
          return (
            <button
              key={i}
              onClick={() => copy(hex)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative flex items-end justify-center pb-2.5"
              style={{
                background: hex,
                flex: isHov ? 1.8 : 1,
                transition: "flex 0.25s ease",
              }}
              title={`Copy ${hex.toUpperCase()}`}
            >
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  color: getTextColor(hex),
                  background: `${hex}bb`,
                  opacity: isHov ? 1 : 0,
                  transform: isHov ? "translateY(0)" : "translateY(5px)",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
              >
                {copiedHex === hex ? "✓ copied" : hex.toUpperCase()}
              </span>
            </button>
          );
        })}

        {copiedHex && (
          <div className="absolute top-2 right-2 bg-gray-950 text-white text-[10px] font-mono px-2.5 py-1 rounded-full shadow-lg pointer-events-none">
            {copiedHex.toUpperCase()} ✓
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 capitalize truncate">{palette.text}</p>
          <p className="text-xs text-gray-400 mt-0.5">{palette.colors.length} colors</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {palette.colors.slice(0, 5).map((rawColor, i) => (
            <span
              key={i}
              onClick={() => copy(toHex(rawColor))}
              className="w-5 h-5 rounded-full border-2 border-white shadow cursor-pointer hover:scale-125 transition-transform duration-150"
              style={{ background: toHex(rawColor) }}
              title={toHex(rawColor).toUpperCase()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
      <div className="h-40 flex">
        {[40, 25, 20, 25, 30].map((w, i) => (
          <div key={i} className="h-full bg-gray-100" style={{ flex: w }} />
        ))}
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="h-3.5 w-3/5 bg-gray-100 rounded-full" />
        <div className="h-3 w-2/5 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PaletteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(q?: string) {
    const term = (q ?? query).trim();
    if (!term) return;
    setQuery(term);
    setActiveChip(q ?? null);
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);

    try {
      const res = await fetch(`/api/palette?q=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: ApiResponse = await res.json();
      const items = Array.isArray(data) ? data : data.items ?? [];
      setResults(items);
    } catch {
      setError("Could not fetch palettes. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* ── Hero Section ── */}
      <section className="max-w-2xl mx-auto px-6 pt-10 pb-12 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[11px] text-gray-500 tracking-widest uppercase mb-6 font-medium shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live · colormagic.app
        </div>

        {/* Heading */}
        <h1
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Find beautiful
          <br />
          <em
            className="not-italic"
            style={{
              background: "linear-gradient(120deg, #FF6B6B 0%, #FFD166 45%, #06D6A0 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            color palettes
          </em>
        </h1>

        <p className="text-gray-400 text-base mb-8 leading-relaxed">
          Search by mood, theme, or vibe.{" "}
          <span className="text-gray-600 font-medium">Click any swatch to copy HEX.</span>
        </p>

        {/* Search Bar */}
        <div className="flex gap-2 bg-white border-2 border-gray-200 focus-within:border-gray-400 rounded-2xl p-1.5 shadow-lg shadow-black/[0.05] transition-all duration-200">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="sunset, ocean, dark academia..."
            className="flex-1 px-4 py-3 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-300 font-medium"
          />
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="bg-gray-950 text-white text-sm font-semibold px-6 py-3 rounded-xl disabled:opacity-40 hover:bg-gray-800 active:scale-95 transition-all duration-200 shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Searching
              </span>
            ) : (
              "Search →"
            )}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => search(s.value)}
              className="text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all duration-200 active:scale-95"
              style={{
                background: activeChip === s.value ? "#111" : "#fff",
                color: activeChip === s.value ? "#fff" : "#666",
                borderColor: activeChip === s.value ? "#111" : "#e5e5e5",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Results Section ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {/* Error */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid */}
        {!loading && results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-900 text-base">{results.length}</span>{" "}
                palettes for{" "}
                <span className="font-semibold text-gray-700">&ldquo;{query}&rdquo;</span>
              </p>
              <button
                onClick={() => { setResults([]); setSearched(false); setActiveChip(null); setQuery(""); inputRef.current?.focus(); }}
                className="text-xs text-gray-400 hover:text-gray-800 font-medium transition-colors"
              >
                ✕ Clear
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((p, i) => <PaletteCard key={p.id} palette={p} index={i} />)}
            </div>
          </>
        )}

        {/* Empty */}
        {!loading && searched && results.length === 0 && !error && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🎨</p>
            <p className="text-gray-500 text-sm font-medium">No palettes found for &ldquo;{query}&rdquo;</p>
            <p className="text-gray-400 text-xs mt-1.5">Try a different keyword</p>
          </div>
        )}

        {/* Default */}
        {!searched && !loading && (
          <div className="text-center py-20">
            <div className="flex justify-center gap-3 mb-6">
              {["#FF6B6B", "#FFD166", "#06D6A0", "#118AB2", "#9B5DE5"].map((c) => (
                <div key={c} className="w-10 h-10 rounded-xl shadow-md" style={{ background: c }} />
              ))}
            </div>
            <p className="text-gray-400 text-sm">Search a mood to discover palettes</p>
          </div>
        )}
      </section>
    </div>
  );
}