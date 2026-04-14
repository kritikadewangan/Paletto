"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/component/navbar/navbar";

// Helper functions for HSB to HEX conversion and random colors
const getRandomHSB = () => ({
  h: Math.floor(Math.random() * 360),
  s: Math.floor(Math.random() * 100),
  b: Math.floor(Math.random() * 100),
});

const hsbToHex = (h: number, s: number, b: number): string => {
  let s_val = s / 100;
  let b_val = b / 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) =>
    b_val * (1 - s_val * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return (
    "#" +
    [Math.round(255 * f(5)), Math.round(255 * f(3)), Math.round(255 * f(1))]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
};

const calculateMatch = (original: any, selection: any): number => {
  const hDiff = Math.abs(original.h - selection.h);
  const hDist = Math.min(hDiff, 360 - hDiff) / 180;
  const sDist = Math.abs(original.s - selection.s) / 100;
  const bDist = Math.abs(original.b - selection.b) / 100;
  const totalDist = hDist * 0.5 + sDist * 0.3 + bDist * 0.2;
  return Math.max(0, Math.round((1 - totalDist) * 10000) / 100);
};

const MEMORIZE_SECS = 5;

export default function ChromaGuessPage() {
  const [gameState, setGameState] = useState<
    "idle" | "ready" | "memorize" | "pick" | "result"
  >("idle");
  const [targetColor, setTargetColor] = useState(getRandomHSB());
  const [selectedColor, setSelectedColor] = useState({ h: 0, s: 50, b: 50 });
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);

  // New State for Rounds and Attempts
  const [currentRound, setCurrentRound] = useState(1);
  const [currentAttempt, setCurrentAttempt] = useState(1);

  const [timer, setTimer] = useState(3);
  const [memoTimer, setMemoTimer] = useState(MEMORIZE_SECS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startReadyCounter = () => {
    // Logic to handle Rounds/Attempts progression
    if (gameState === "result") {
      if (currentAttempt < 3) {
        setCurrentAttempt((prev) => prev + 1);
      } else {
        if (currentRound < 5) {
          setCurrentRound((prev) => prev + 1);
          setCurrentAttempt(1);
        } else {
          // Reset Game after 5 rounds
          setCurrentRound(1);
          setCurrentAttempt(1);
        }
      }
    }

    setGameState("ready");
    setTimer(3);
    setMemoTimer(MEMORIZE_SECS);
    setTargetColor(getRandomHSB());
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState("memorize");
          startMemoryCounter();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startMemoryCounter = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setMemoTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState("pick");
          return MEMORIZE_SECS;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitGuess = () => {
    const match = calculateMatch(targetColor, selectedColor);
    setMatchPercentage(match);
    setGameState("result");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-gray-950">
      <Navbar />
      <main className="max-w-4xl mx-auto pt-20 pb-20 px-6 flex flex-col items-center">
        {/* --- PAGE 1: START SCREEN --- */}
        {gameState === "idle" && (
          <div className="text-center w-full max-w-lg bg-white p-12 rounded-lg  flex flex-col items-center border border-[#ece9e3] ">
            <h1
              className="text-5xl font-black leading-none tracking-tight mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Hex
              <br />
              <span
                className="non-italic"
                style={{
                  background:
                    "linear-gradient(120deg, #FF6B6B 0%, #FFD166 45%, #06D6A0 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                Master
              </span>
            </h1>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed px-4">
              An ultimate test of your color memory.
              <br />
              Can you match the hue, saturation, and brightness?
            </p>
            <div className="flex flex-col gap-3 mb-10 text-left w-full">
              {[
                "Memorize the color shown for 5 seconds",
                "Adjust HSB sliders to replicate the exact shade",
                "See how close you got with a percentage score",
              ].map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 text-sm text-gray-600 border border-black/[0.03]"
                >
                  <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-medium">{rule}</span>
                </div>
              ))}
            </div>
            <button
              onClick={startReadyCounter}
              className="bg-black text-white px-10 py-3.5 rounded-full text-[15px] font-semibold hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}

       {/* --- PAGE 2: READY-SET-GO --- */}
{gameState === "ready" && (
  <div className="bg-black w-full max-w-[400px] aspect-square rounded-lg shadow-2xl relative flex items-center justify-center animate-in fade-in duration-500 mx-auto">
    <span className="absolute top-6 left-6 text-xs font-bold text-white/50 uppercase tracking-widest">
      Attempt {currentAttempt}/3
    </span>
    <span className="text-2xl md:text-3xl font-black text-white leading-none uppercase tracking-[0.2em] ">
      {timer === 3 ? "ready" : timer === 2 ? "set" : "go"}
    </span>
  </div>
)}

{/* --- PAGE 3: MEMORIZE --- */}
{gameState === "memorize" && (
  <div
    className="w-full max-w-[400px] aspect-square rounded-lg shadow-2xl relative p-6 md:p-10 flex flex-col items-center justify-center animate-in fade-in duration-500 transition-colors duration-500 mx-auto"
    style={{
      backgroundColor: hsbToHex(targetColor.h, targetColor.s, targetColor.b),
    }}
  >
    <span className="absolute top-6 left-6 text-xs font-bold text-white/70 uppercase tracking-widest">
      Attempt {currentAttempt}/3
    </span>
    <div className="flex flex-col items-center justify-center w-full">
      <div className="text-[80px] md:text-[100px] font-black text-white leading-none flex tracking-tighter drop-shadow-lg">
        <span className="text-white/30">0</span>
        {memoTimer.toString().padStart(2, "0")}
      </div>
      <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em] mt-2 drop-shadow-sm text-center">
        Seconds to remember
      </p>
      <div className="w-32 md:w-48 bg-black/10 h-1.5 rounded-full mt-8 overflow-hidden backdrop-blur-sm">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ width: `${(memoTimer / MEMORIZE_SECS) * 100}%` }}
        />
      </div>
    </div>
  </div>
)}

{/* --- PAGE 4: PICK --- */}

        {gameState === "pick" && (

          <div

            className="w-full max-w-[500px] h-[400px] rounded-lg  relative flex overflow-hidden animate-in slide-in-from-bottom-8 duration-700 transition-colors duration-300"

            style={{

              backgroundColor: hsbToHex(

                selectedColor.h,

                selectedColor.s,

                selectedColor.b,

              ),

            }}

          >

            <div className="relative w-20 h-full bg-black/10 backdrop-blur-lg border-r border-white/10 group">

              <input

                type="range"

                min="0"

                max="360"

                step="1"

                value={selectedColor.h}

                onChange={(e) =>

                  setSelectedColor({

                    ...selectedColor,

                    h: parseInt(e.target.value),

                  })

                }

                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"

                style={{ WebkitAppearance: "slider-vertical" }}

              />

              <div

                className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-3 rounded-full shadow-inner"

                style={{

                  background:

                    "linear-gradient(to top, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))",

                }}

              />

              <div

                className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-2xl border-[3px] border-white pointer-events-none z-20"

                style={{

                  bottom: `calc(${(selectedColor.h / 360) * 100}% + 20px)`,

                }}

              />

            </div>

            <div className="relative w-20 h-full bg-black/10 backdrop-blur-lg border-r border-white/10 group">

              <input

                type="range"

                min="0"

                max="100"

                step="1"

                value={selectedColor.s}

                onChange={(e) =>

                  setSelectedColor({

                    ...selectedColor,

                    s: parseInt(e.target.value),

                  })

                }

                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"

                style={{ WebkitAppearance: "slider-vertical" }}

              />

              <div

                className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-3 rounded-full shadow-inner"

                style={{

                  background: `linear-gradient(to top, hsl(${selectedColor.h}, 0%, ${selectedColor.b / 2}%), hsl(${selectedColor.h}, 100%, ${selectedColor.b}%))`,

                }}

              />

              <div

                className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-2xl border-[3px] border-white pointer-events-none z-20"

                style={{ bottom: `calc(${selectedColor.s}% + 20px)` }}

              />

            </div>

            <div className="relative w-20 h-full bg-black/10 backdrop-blur-lg group">

              <input

                type="range"

                min="0"

                max="100"

                step="1"

                value={selectedColor.b}

                onChange={(e) =>

                  setSelectedColor({

                    ...selectedColor,

                    b: parseInt(e.target.value),

                  })

                }

                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"

                style={{ WebkitAppearance: "slider-vertical" }}

              />

              <div

                className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-3 rounded-full shadow-inner"

                style={{

                  background: `linear-gradient(to top, black, ${hsbToHex(selectedColor.h, selectedColor.s, 100)})`,

                }}

              />

              <div

                className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-2xl border-[3px] border-white pointer-events-none z-20"

                style={{ bottom: `calc(${selectedColor.b}% + 20px)` }}

              />

            </div>

            <button

              onClick={submitGuess}

              className="absolute bottom-10 right-10 bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all group z-40"

            >

              <svg

                xmlns="http://www.w3.org/2000/svg"

                width="32"

                height="32"

                viewBox="0 0 24 24"

                fill="none"

                stroke="currentColor"

                strokeWidth="2"

                strokeLinecap="round"

                strokeLinejoin="round"

                className="group-hover:rotate-90 transition-transform duration-500"

              >

                <circle cx="12" cy="12" r="10" />

                <circle cx="12" cy="12" r="6" />

                <circle cx="12" cy="12" r="2" />

              </svg>

            </button>

          </div>

        )}

{/* --- PAGE 5: RESULT --- */}
{gameState === "result" && (
  <div className="w-full max-w-[450px] aspect-[4/5] md:aspect-square rounded-lg relative flex flex-col overflow-hidden animate-in zoom-in duration-500  mx-auto">
    <div
      className={`flex-1 p-6 md:p-8 relative flex flex-col justify-between transition-colors duration-500 ${selectedColor.b < 60 ? "text-white" : "text-black"}`}
      style={{ backgroundColor: hsbToHex(selectedColor.h, selectedColor.s, selectedColor.b) }}
    >
      <span className={`absolute top-6 left-6 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${selectedColor.b < 60 ? "bg-white/10" : "bg-black/10"}`}>
        Attempt {currentAttempt}/3
      </span>
      <div className="text-right mt-4">
        <div className="text-5xl md:text-6xl font-black leading-none tracking-tighter">
          {matchPercentage?.toFixed(0)}%
        </div>
        <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider opacity-70 mt-1">Match Accuracy</p>
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-bold opacity-60 uppercase">Your Pick</p>
        <p className="text-lg md:text-xl font-black tracking-tight">H{selectedColor.h} S{selectedColor.s} B{selectedColor.b}</p>
      </div>
    </div>
    <div
      className={`h-[100px] md:h-[130px] p-6 flex justify-between items-center relative ${targetColor.b < 60 ? "text-white" : "text-black"}`}
      style={{ backgroundColor: hsbToHex(targetColor.h, targetColor.s, targetColor.b) }}
    >
      <div>
        <p className="text-[10px] font-bold opacity-60 uppercase">Target</p>
        <p className="text-lg md:text-xl font-black tracking-tight">H{targetColor.h} S{targetColor.s} B{targetColor.b}</p>
      </div>
      <button
        onClick={startReadyCounter}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all ${targetColor.b < 60 ? "bg-white text-black" : "bg-black text-white"}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
      </button>
    </div>
  </div>
)}
      </main>
    </div>
  );
}
