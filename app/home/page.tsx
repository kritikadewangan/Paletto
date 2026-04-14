"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
type PaletteItem = {
  id: string;
  text: string;
  colors: string[];
  likesCount?: number;
};

// Formatting helpers
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

function PaletteCard({
  palette,
  index,
}: {
  palette: PaletteItem;
  index: number;
}) {
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

  // PaletteCard component ke andar return block ko aise update karein:
return (
  <div
    className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
    }}
  >
    {/* Color Bars Section */}
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
          >
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
              style={{
                color: getTextColor(hex),
                background: `${hex}bb`,
                opacity: isHov ? 1 : 0,
              }}
            >
              {copiedHex === hex ? "✓ copied" : hex.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>

    {/* Yahan se click karne par naya page khulega */}
    <Link href={`/palette/${palette.id || index}?colors=${palette.colors.map(c => c.replace('#','')).join(',')}&name=${palette.text}`}>
      <div className="px-4 py-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 capitalize truncate">
            {palette.text}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">View Details & Save →</p>
        </div>
      </div>
    </Link>
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

export default function HomePage() {
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

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const data = await res.json();

      // Handling different possible data structures from the proxy
      let finalItems: PaletteItem[] = [];
      if (Array.isArray(data)) {
        finalItems = data;
      } else if (data && typeof data === "object") {
        finalItems = data.items || data.palettes || data.result || [];
      }

      setResults(finalItems);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load palettes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[11px] text-gray-500 tracking-widest uppercase mb-6 font-medium shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Proxy Active · bypass-cors
        </div>

        <h1
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Find beautiful
          <br />
          <em
            className="not-italic"
            style={{
              background:
                "linear-gradient(120deg, #FF6B6B 0%, #FFD166 45%, #06D6A0 90%)",

              WebkitBackgroundClip: "text",

              WebkitTextFillColor: "transparent",
            }}
          >
            color palettes
          </em>
        </h1>

        <div className="flex gap-2 bg-white border-2 border-gray-200 focus-within:border-gray-400 rounded-2xl p-1.5 shadow-lg transition-all duration-200">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search mood (e.g. sunset)..."
            className="flex-1 px-4 py-3 text-sm outline-none font-medium"
          />
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="bg-gray-950 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-all"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => search(s.value)}
              className="text-xs px-3.5 py-1.5 rounded-full border transition-all"
              style={{
                background: activeChip === s.value ? "#111" : "#fff",
                color: activeChip === s.value ? "#fff" : "#666",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {error && <p className="text-center text-red-500 text-sm">{error}</p>}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((p, i) => (
              <PaletteCard key={p.id || i} palette={p} index={i} />
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="text-center py-20 text-gray-400">
            No palettes found.
          </div>
        )}
       {!searched && !loading && (
  <div className="text-center py-20">
    <div className="flex justify-center gap-3 mb-6">
      {["#FF6B6B", "#FFD166", "#06D6A0", "#118AB2"].map((c, i) => (
        <div
          key={c}
          className="w-10 h-10 rounded-xl shadow-md"
          style={{
            background: c,
            // Navbar wali animation apply kar rahe hain
            animation: "wave 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`, 
          }}
        />
      ))}
    </div>
    <p className="text-gray-400 text-sm">Search a mood to discover palettes</p>
  </div>
)}
      </section>
    </div>
  );
}
