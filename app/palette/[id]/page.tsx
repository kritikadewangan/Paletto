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

  // FIX: Export Function updated to handle "lab" color error
  const handleExport = async () => {
    if (!paletteRef.current) return;

    try {
      const canvas = await html2canvas(paletteRef.current, {
        scale: 3, // Quality aur behtar karne ke liye
        useCORS: true,
        backgroundColor: "#ffffff",
        // 'ignoreElements' use karke hum kisi bhi bug-causing element ko hata sakte hain
        // lekin yahan hum ensure karenge ki background color handle ho
        onclone: (clonedDoc) => {
          // Cloned document mein check karein ki koi invalid styles toh nahi hain
          const elements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < elements.length; i++) {
            // Agar browser lab() support nahi karta toh html2canvas crash hota hai
            // Isliye hum complex styles ko clean kar dete hain cloned version mein
            const el = elements[i] as HTMLElement;
            if (el.style.color.includes("lab")) el.style.color = "white";
          }
        },
      });

      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `${name.replace(/\s+/g, "-")}-palette.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Something went wrong during export. Try refreshing the page.");
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
      localStorage.getItem("paletto_saved") || "[]",
    );
    const alreadyExists = existingSaved.find(
      (p: SavedPalette) => p.id === paletteToSave.id,
    );

    if (!alreadyExists) {
      const updatedSaved = [paletteToSave, ...existingSaved];
      localStorage.setItem("paletto_saved", JSON.stringify(updatedSaved));
      setIsSaved(true);
    } else {
      setIsSaved(true);
    }
  };

  const nameGradient = `linear-gradient(to right, ${colors.map((c) => `#${c.replace("#", "")}`).join(", ")})`;

  return (
    <div className="min-h-screen bg-[#fcfbf9] pt-10 pb-12 px-6">
        <Navbar/>
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-12 border-b border-black/[0.03] pb-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-black transition-all"
          >
            Back to Explore
          </Link>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-white border border-gray-200 hover:border-black rounded-full text-xs font-bold transition-all uppercase tracking-wider shadow-sm active:scale-95"
            >
              Download PNG
            </button>

            <button
              onClick={handleSave}
              className="px-8 py-2 rounded-full text-xs font-black transition-all uppercase tracking-widest shadow-lg active:scale-95 bg-black text-white hover:bg-gray-800"
            >
              <span className="relative z-10">
                {isSaved ? "✓ Saved" : "Save Palette"}
              </span>
            </button>
          </div>
        </div>

        {/* Title Section */}
        <div className="mb-10 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold capitalize tracking-tight"
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
          <p className="text-gray-400 text-[14px] uppercase tracking-[0.3em] mt-2 font-medium">
            Professional Color Scheme
          </p>
        </div>

        {/* Palette View */}
        <div
          ref={paletteRef}
          className="w-full h-[55vh] min-h-[450px] flex rounded-[32px] overflow-hidden shadow-xl bg-white p-1 border border-gray-100"
        >
          {colors.map((c, i) => {
            const hex = `#${c.replace("#", "")}`;
            return (
              <div
                key={i}
                onClick={() => copyToClipboard(hex)}
                className="group relative flex-1 h-full flex flex-col items-center justify-end pb-10 cursor-pointer transition-all duration-500 hover:flex-[1.4] first:rounded-l-[22px] last:rounded-r-[22px]"
                style={{ backgroundColor: hex }}
              >
                <div className="flex flex-col items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="text-white font-mono font-bold text-xl drop-shadow-md uppercase tracking-tight pointer-events-none">
                    {hex}
                  </span>
                  <div className="px-3 py-1 bg-black/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[9px] font-bold uppercase tracking-tighter">
                      {copiedHex === hex ? "✓ Copied" : "Copy HEX"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
