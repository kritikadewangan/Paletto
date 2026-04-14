"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/component/navbar/navbar";

type SavedPalette = {
  id: string;
  name: string;
  colors: string[];
  savedAt: string;
};

export default function SavedPage() {
  const [loading, setLoading] = useState(true);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);

  useEffect(() => {
    // Fixed: Handle null case for localStorage.getItem()
    const savedData = localStorage.getItem("paletto_saved");
    const data: SavedPalette[] = savedData ? JSON.parse(savedData) : [];
    setSavedPalettes(data);
    setLoading(false);
  }, []);

  const deletePalette = (id: string) => {
    const updated = savedPalettes.filter((p) => p.id !== id);
    setSavedPalettes(updated);
    localStorage.setItem("paletto_saved", JSON.stringify(updated));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
          <p className="text-gray-400 animate-pulse font-medium">Loading your collection...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/50 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 text-center">
            <h1
              className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
              style={{
                fontFamily: "'Fraunces', serif",
                background: "linear-gradient(120deg, #FF6B6B 0%, #FFD166 45%, #06D6A0 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block"
              }}
            >
              Your Library
            </h1>

            <p className="text-gray-500 max-w-md mx-auto">
              All your curated color palettes saved in one place.
            </p>
          </div>

          {savedPalettes.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
              <p className="text-gray-400 mb-6">You haven&apos;t saved any palettes yet.</p>
              <Link
                href="/"
                className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all"
              >
                Explore Palettes
              </Link>
            </div>
          ) : (
            /* Palettes Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className="group bg-white rounded-[28px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Colors Preview */}
                  <Link href={`/palette/${palette.id}?colors=${palette.colors.map(c => c.replace('#', '')).join(',')}&name=${palette.name}`}>
                    <div className="h-40 flex cursor-pointer">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 h-full transition-all group-hover:flex-[1.2]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </Link>

                  {/* Details Section */}
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize truncate max-w-[150px]">
                        {palette.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                        {new Date(palette.savedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deletePalette(palette.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="Remove from library"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}