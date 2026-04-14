"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/component/navbar/navbar";

const randHex = (): string =>
  "#" +
  [0, 0, 0]
    .map(() =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const makePalette = (base?: string): string[] => {
  const p = [base ?? randHex()];
  for (let i = 0; i < 4; i++) p.push(randHex());
  return p.sort(() => Math.random() - 0.5);
};

type Screen = "start" | "memorize" | "guess" | "roundResult" | "final";

interface RoundRecord {
  success: boolean;
  pts: number;
  attResults: boolean[];
  correctPalette: string[];
  target: string;
}

const TOTAL_ROUNDS = 3;
const MAX_ATTEMPTS = 3;
const MEMORIZE_SECS = 5;
const PTS_BY_ATTEMPT = [30, 20, 10];

export default function GamePage() {
  const [screen, setScreen] = useState<Screen>("start");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [roundHistory, setRoundHistory] = useState<RoundRecord[]>([]);

  const [targetColor, setTargetColor] = useState("");
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_SECS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [palettes, setPalettes] = useState<string[][]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [attResults, setAttResults] = useState<boolean[]>([]);
  const [lockedWrong, setLockedWrong] = useState<number[]>([]);
  const [flashIdx, setFlashIdx] = useState<{ idx: number; ok: boolean } | null>(
    null,
  );
  const [lastRecord, setLastRecord] = useState<RoundRecord | null>(null);

  useEffect(() => {
    if (screen !== "memorize") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setScreen("guess");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  const startGame = () => {
    setScore(0);
    setRound(0);
    setRoundHistory([]);
    beginRound(1);
  };

  const beginRound = (r: number) => {
    setRound(r);
    setAttempt(0);
    setAttResults([]);
    setLockedWrong([]);
    setFlashIdx(null);
    const color = randHex();
    setTargetColor(color);
    const shuffled = [
      makePalette(color),
      makePalette(),
      makePalette(),
      makePalette(),
    ].sort(() => Math.random() - 0.5);
    setPalettes(shuffled);
    setCorrectIdx(shuffled.findIndex((p) => p.includes(color)));
    setTimeLeft(MEMORIZE_SECS);
    setScreen("memorize");
  };

  const nextRound = () =>
    round >= TOTAL_ROUNDS ? setScreen("final") : beginRound(round + 1);

  const handleGuess = useCallback(
    (idx: number) => {
      if (lockedWrong.includes(idx) || flashIdx !== null) return;
      const correct = idx === correctIdx;
      setFlashIdx({ idx, ok: correct });
      setTimeout(() => {
        setFlashIdx(null);
        if (correct) {
          const pts = PTS_BY_ATTEMPT[attempt] ?? 10;
          const newScore = score + pts;
          setScore(newScore);
          const rec: RoundRecord = {
            success: true,
            pts,
            attResults: [...attResults, true],
            correctPalette: palettes[correctIdx],
            target: targetColor,
          };
          setLastRecord(rec);
          setRoundHistory((h) => [...h, rec]);
          setScreen("roundResult");
        } else {
          const newAttempt = attempt + 1;
          const newResults = [...attResults, false];
          setAttempt(newAttempt);
          setAttResults(newResults);
          setLockedWrong((w) => [...w, idx]);
          if (newAttempt >= MAX_ATTEMPTS) {
            setScore(0);
            const rec: RoundRecord = {
              success: false,
              pts: 0,
              attResults: newResults,
              correctPalette: palettes[correctIdx],
              target: targetColor,
            };
            setLastRecord(rec);
            setRoundHistory((h) => [...h, rec]);
            setScreen("roundResult");
          }
        }
      }, 500);
    },
    [
      lockedWrong,
      flashIdx,
      correctIdx,
      attempt,
      score,
      attResults,
      palettes,
      targetColor,
    ],
  );

  const timerWidth = `${(timeLeft / MEMORIZE_SECS) * 100}%`;

  return (
    <div className="min-h-screen bg-[#f8f6f2] text-gray-900">
      <Navbar />
      <main className="max-w-[600px] mx-auto pt-20 pb-20 px-5 flex flex-col items-center">
        {/* Top bar */}
        

        <div className="text-center w-full max-w-lg bg-white p-12 rounded-lg  flex flex-col items-center border border-[#ece9e3] ">
          {/* START */}
          {screen === "start" && (
            <div className="text-center w-full">
              <h1
                className="text-[48px] font-black leading-none tracking-tight mb-3"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Color
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
                  Memory
                </span>
              </h1>
              <p className="text-sm text-gray-400 mb-7 leading-relaxed">
                3 rounds · 3 attempts each
                <br />
                Memorize, then find the palette
              </p>
              <div className="flex flex-col gap-2.5 mb-8 text-left">
                {[
                  "A color block shows for 5 seconds",
                  "Pick the palette that contained it",
                  "Faster correct guess = more points",
                ].map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-500"
                  >
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {rule}
                  </div>
                ))}
              </div>
              <button
                onClick={startGame}
                className="bg-black text-white px-12 py-3.5 rounded-full text-[15px] font-semibold hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Start Game
              </button>
            </div>
          )}

          {/* MEMORIZE */}
          {screen === "memorize" && (
            <div className="text-center w-full">
              <p className="text-[12px] tracking-[2.5px] uppercase text-gray-600 font-semibold mb-5">
                Memorize this color
              </p>
              <div
                className="w-full h-48 rounded-2xl mb-5 relative overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: targetColor }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              </div>
              <p className="font-mono text-sm text-gray-400 tracking-widest mb-7">
                {targetColor.toUpperCase()}
              </p>
              <div className="w-full bg-[#f0ede8] rounded-full h-1.5 overflow-hidden mb-2.5">
                <div
                  className="h-full bg-gray-800 rounded-full transition-[width] duration-1000 ease-linear"
                  style={{ width: timerWidth }}
                />
              </div>
              <p
                className="text-xl font-black text-gray-800"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {timeLeft}
              </p>
              <p className="text-xs text-gray-300 mt-1.5">
                Then pick the matching palette
              </p>
            </div>
          )}

          {/* GUESS */}
          {screen === "guess" && (
            <div className="w-full">
              <p className="text-center text-[10px] tracking-[2.5px] uppercase text-gray-300 font-semibold mb-4">
                Which palette had this color?
              </p>

              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-xs text-gray-300 mr-1">
                  Attempt {attempt + 1}/{MAX_ATTEMPTS}
                </span>
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                  const done = i < attResults.length;
                  const active = i === attResults.length;
                  return (
                    <span
                      key={i}
                      className={`rounded-full w-2.5 h-2.5 transition-all duration-300 ${done ? (attResults[i] ? "bg-green-400" : "bg-red-400") : active ? "bg-gray-800 scale-125" : "bg-[#e5e2dc]"}`}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {palettes.map((pal, i) => {
                  const isLocked = lockedWrong.includes(i);
                  const flash = flashIdx?.idx === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleGuess(i)}
                      disabled={isLocked}
                      className={`relative flex h-20  rounded-2xl overflow-hidden transition-all duration-200
                        ${isLocked ? "opacity-25 cursor-not-allowed" : "cursor-pointer hover:scale-[1.025]"}
                        ${flash && flashIdx?.ok ? "ring-[3px] ring-green-400 ring-offset-2 scale-[1.025]" : ""}
                        ${flash && !flashIdx?.ok ? "ring-[3px] ring-red-400 ring-offset-2" : ""}
                        ${!flash && !isLocked ? "border-2 border-transparent hover:border-gray-200" : "border-2 border-transparent"}
                      `}
                    >
                      {pal.map((c, ci) => (
                        <div
                          key={ci}
                          className="flex-1"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <span className="absolute top-1.5 left-2 w-[18px] h-[18px] rounded-full bg-black/25 text-white text-[10px] font-bold flex items-center justify-center backdrop-blur-sm">
                        {i + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ROUND RESULT */}
          {screen === "roundResult" && lastRecord && (
            <div className="text-center w-full">
              <div className="text-5xl mb-3 leading-none">
                {lastRecord.success ? "🎉" : "😢"}
              </div>
              <h2
                className="text-[30px] font-black tracking-tight mb-1"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {lastRecord.success ? "Found it!" : "Missed it"}
              </h2>
              <p className="font-mono text-xs text-gray-300 tracking-widest mb-5">
                The color was {lastRecord.target.toUpperCase()}
              </p>
              <div className="flex h-12 rounded-2xl overflow-hidden w-full mb-5">
                {lastRecord.correctPalette.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2 justify-center mb-4">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                  const r = lastRecord.attResults[i];
                  return (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${r === true ? "bg-green-100 text-green-600" : r === false ? "bg-red-100 text-red-400" : "bg-gray-100 text-gray-300"}`}
                    >
                      {r === true ? "✓" : r === false ? "✗" : "—"}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 mb-7">
                {lastRecord.success ? (
                  <>
                    <span>Round score: </span>
                    <strong className="text-gray-800 font-bold">
                      +{lastRecord.pts} pts
                    </strong>
                  </>
                ) : (
                  "Score reset to 0"
                )}
              </p>
              <button
                onClick={nextRound}
                className="bg-black text-white px-10 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                {round >= TOTAL_ROUNDS ? "See Final Score →" : "Next Round →"}
              </button>
            </div>
          )}

          {/* FINAL */}
          {screen === "final" && (
            <div className="text-center w-full">
              <p className="text-[12px] tracking-[2.5px] uppercase text-gray-500 font-semibold mb-2">
                Final Score
              </p>
              <p
                className="text-[88px] font-black leading-none tracking-tight mb-1"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {score}
              </p>
              <span className="inline-block text-sm text-gray-500 bg-[#f5f4f1] rounded-full px-5 py-2 mb-7">
                {score >= 80
                  ? "Color Master! Incredible eye!"
                  : score >= 60
                    ? "Great job! Sharp memory!"
                    : score >= 40
                      ? "Nice work — keep practicing!"
                      : score >= 20
                        ? "Good start, keep going!"
                        : "Train your eye more!"}
              </span>
              <div className="flex gap-2.5 justify-center w-full mb-8">
                {roundHistory.map((r, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#f8f6f2] rounded-2xl py-3.5 text-center"
                  >
                    <p
                      className="text-xl font-black"
                      style={{
                        fontFamily: "'Fraunces', serif",
                        color: r.success ? "#22c55e" : "#f87171",
                      }}
                    >
                      {r.success ? `+${r.pts}` : "0"}
                    </p>
                    <p className="text-[12px] uppercase tracking-widest text-gray-500 mt-1">
                      Round {i + 1}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 justify-center">
                <button
                  onClick={() => setScreen("start")}
                  className="bg-white text-gray-700 border border-[#e5e2dc] px-7 py-3 rounded-full text-sm font-semibold hover:border-gray-400 transition-all"
                >
                  Home
                </button>
                <button
                  onClick={startGame}
                  className="bg-black text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {screen === "start" && (
          <p className="mt-7 text-xs text-gray-400 text-center leading-relaxed">
            1st attempt = 30 pts · 2nd = 20 pts · 3rd = 10 pts
            <br />
            Miss all 3 → score resets to 0
          </p>
        )}
      </main>
    </div>
  );
}

