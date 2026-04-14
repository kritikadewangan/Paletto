"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import Navbar from "@/component/navbar/navbar";

type SavedPalette = {
  id: string;
  name: string;
  colors: string[];
  savedAt: string;
};

export default function PaletteDetailPage() {
  const searchParams = useSearchParams();
  const paletteRef = useRef<HTMLDivElement>(null);

  const name = searchParams.get("name") || "Beautiful Palette";
  const colors = searchParams.get("colors")?.split(",") || [];

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleExport = async () => {
    if (!paletteRef.current) return;
    try {
      const canvas = await html2canvas(paletteRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            if (el.style.color.includes("lab")) el.style.color = "white";
          }
        },
      });

      const image = canvas.toDataURL("image/png", 1.0);
      
    } catch (err) {
      console.error("Export failed:", err);
      
    }
  };

  const handleSave = () => {
    const paletteToSave: SavedPalette = {
      id: name + colors.join(""),
      name: name,
      colors: colors.map((c) => `#${c.replace("#", "")}`),
      savedAt: new Date().toISOString(),
    };

    const existingSaved: SavedPalette[] = JSON.parse(
      localStorage.getItem("paletto_saved") || "[]"
    );
    const alreadyExists = existingSaved.find((p: SavedPalette) => p.id === paletteToSave.id);

    if (!alreadyExists) {
      localStorage.setItem("paletto_saved", JSON.stringify([paletteToSave, ...existingSaved]));
    }
    setIsSaved(true);
  };

  const nameGradient = `linear-gradient(to right, ${colors.map((c) => `#${c.replace("#", "")}`).join(", ")})`;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-10 md:pt-10 pb-12 px-4 md:px-6">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation - Responsive stacking */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-12 border-b border-black/[0.03] pb-6 gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-black transition-all"
          >
             Back to Explore
          </Link>

          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
           

            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-6 md:px-8 py-2.5 rounded-full text-[10px] md:text-xs font-black transition-all uppercase tracking-widest shadow-lg active:scale-95 bg-black text-white hover:bg-gray-800"
            >
              {isSaved ? "✓ Saved" : "Save Palette"}
            </button>
          </div>
        </div>

        {/* Title Section - Responsive font sizes */}
        <div className="mb-8 md:mb-10 text-center px-2">
          <h1
            className="text-3xl sm:text-4xl md:text-6xl font-bold capitalize tracking-tight leading-tight"
            style={{
              fontFamily: "'Fraunces', serif",
              backgroundImage: nameGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            {name}
          </h1>
          <p className="text-gray-400 text-[10px] md:text-[14px] uppercase tracking-[0.2em] md:tracking-[0.3em] mt-3 font-medium">
            Professional Color Scheme
          </p>
        </div>

        {/* Palette View - Column on mobile, Row on desktop */}
        <div
          ref={paletteRef}
          className="w-full flex flex-col md:flex-row h-auto md:h-[55vh] min-h-[500px] md:min-h-[450px] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-xl bg-white p-1 border border-gray-100"
        >
          {colors.map((c, i) => {
            const hex = `#${c.replace("#", "")}`;
            return (
              <div
                key={i}
                onClick={() => copyToClipboard(hex)}
                className="group relative flex-1 min-h-[100px] md:h-full flex flex-row md:flex-col items-center justify-between md:justify-end p-6 md:pb-10 cursor-pointer transition-all duration-500 md:hover:flex-[1.4] first:rounded-t-[20px] last:rounded-b-[20px] md:first:rounded-tr-none md:last:rounded-bl-none md:first:rounded-l-[22px] md:last:rounded-r-[22px]"
                style={{ backgroundColor: hex }}
              >
                {/* Hex Code Label */}
                <span className="text-white font-mono font-bold text-lg md:text-xl drop-shadow-md uppercase tracking-tight pointer-events-none">
                  {hex}
                </span>

                {/* Status Label (Visible on click/hover) */}
                <div className={`px-3 py-1 bg-black/20 backdrop-blur-md rounded-full transition-all duration-300 ${copiedHex === hex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0'}`}>
                  <span className="text-white text-[9px] font-bold uppercase tracking-tighter">
                    {copiedHex === hex ? "✓ Copied" : "Copy HEX"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}