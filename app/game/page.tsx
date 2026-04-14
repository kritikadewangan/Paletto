"use client";

import Link from "next/link";
import Navbar from "@/component/navbar/navbar";

const GAMES = [
  {
    id: "memory",
    title: "Color Memory",
    description: "Memorize the color and find its hidden palette.",
    icon: "",
    href: "/game/color-memory", 
    gradient: "from-[#FF6B6B] to-[#FFD166]",
  },
  {
    id: "guess",
    title: "Hex Master",
    description: "Guess the correct hex code for the shown color.",
    icon: "",
    href: "/game/hex-master",
    gradient: "from-[#06D6A0] to-[#118AB2]",
  },
  
];

export default function GameSelectionPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto pt-32 pb-20 px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Play & <span 
              style={{
                background: "linear-gradient(120deg, #FF6B6B 0%, #FFD166 45%, #06D6A0 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block"
              }}
            >Master</span>
          </h1>
          <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">
            Choose a challenge to test your color sense
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {GAMES.map((game) => (
            <Link 
              key={game.id} 
              href={game.href}
              className="group relative bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background Gradient Blur */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${game.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-3xl mb-8 shadow-lg shadow-black/5`}>
                {game.icon}
              </div>

              <h2 className="text-2xl font-black mb-3 tracking-tight text-gray-900">
                {game.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                {game.description}
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-black group-hover:gap-4 transition-all">
                Play Now <span className="text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
