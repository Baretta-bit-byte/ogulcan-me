"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Undo2,
  Trophy,
  Lightbulb,
  X,
  Timer as TimerIcon,
  ChevronRight,
  Info,
} from "lucide-react";
import Footer from "@/components/Footer";

// ─── Knight's Tour Logic ──────────────────────────────────────────────────────

const DELTAS: [number, number][] = [
  [-2, -1], [-2, 1],
  [-1, -2], [-1, 2],
  [1, -2],  [1, 2],
  [2, -1],  [2, 1],
];

function getMoves(
  r: number,
  c: number,
  vis: boolean[][],
  n: number
): [number, number][] {
  return DELTAS
    .map(([dr, dc]): [number, number] => [r + dr, c + dc])
    .filter(([nr, nc]) => nr >= 0 && nr < n && nc >= 0 && nc < n && !vis[nr][nc]);
}

/**
 * Warnsdorff's heuristic: choose the next move with the fewest onward moves.
 * Ties broken by secondary Warnsdorff (deeper lookahead).
 */
function warnsdorff(
  r: number,
  c: number,
  vis: boolean[][],
  n: number
): [number, number] | null {
  const moves = getMoves(r, c, vis, n);
  if (!moves.length) return null;
  return [...moves].sort((a, b) => {
    const aCount = getMoves(a[0], a[1], vis, n).length;
    const bCount = getMoves(b[0], b[1], vis, n).length;
    if (aCount !== bCount) return aCount - bCount;
    // Secondary: sum of onward counts (deeper lookahead for ties)
    const aSum = getMoves(a[0], a[1], vis, n)
      .reduce((acc, [nr, nc]) => acc + getMoves(nr, nc, vis, n).length, 0);
    const bSum = getMoves(b[0], b[1], vis, n)
      .reduce((acc, [nr, nc]) => acc + getMoves(nr, nc, vis, n).length, 0);
    return aSum - bSum;
  })[0];
}

/** Chess algebraic notation: (0,0) → a8 for 8×8 */
function notation(r: number, c: number, n: number): string {
  return `${String.fromCharCode(97 + c)}${n - r}`;
}

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Snapshot {
  pos: [number, number];
  vis: boolean[][];
  order: [number, number][];
}

interface LBEntry {
  name: string;
  /** 3 = closed, 2 = open, 0–1 = fraction for partial */
  score: number;
  label: string;
  moves: number;
  secs: number;
  size: number;
  date: string;
}

type Phase = "placing" | "playing" | "done";

// ─── Component ────────────────────────────────────────────────────────────────

export default function KnightsTourPage() {
  // ── Board / game state ─────────────────────────────────────────────────────
  const [size, setSize]     = useState(8);
  const [vis, setVis]       = useState<boolean[][]>([]);
  const [order, setOrder]   = useState<[number, number][]>([]);
  const [pos, setPos]       = useState<[number, number] | null>(null);
  const [start, setStart]   = useState<[number, number] | null>(null);
  const [phase, setPhase]   = useState<Phase>("placing");
  const [hist, setHist]     = useState<Snapshot[]>([]);

  // ── Hint ───────────────────────────────────────────────────────────────────
  const [hintCell, setHintCell]     = useState<[number, number] | null>(null);
  const [showHint, setShowHint]     = useState(false);
  const hintTimerRef                = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [secs, setSecs]     = useState(0);
  const tickRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Result ─────────────────────────────────────────────────────────────────
  const [score, setScore]           = useState(0);
  const [scoreLabel, setScoreLabel] = useState("");
  const [resultMsg, setResultMsg]   = useState("");

  // ── Leaderboard / name dialog ──────────────────────────────────────────────
  const [lb, setLb]                 = useState<LBEntry[]>([]);
  const [showLb, setShowLb]         = useState(false);
  const [nameInput, setNameInput]   = useState("");
  const [showNameDlg, setShowNameDlg] = useState(false);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback((n: number) => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    setVis(Array.from({ length: n }, () => Array(n).fill(false)));
    setOrder([]);
    setPos(null);
    setStart(null);
    setPhase("placing");
    setHist([]);
    setHintCell(null);
    setShowHint(false);
    setSecs(0);
    setScore(0);
    setScoreLabel("");
    setResultMsg("");
    setNameInput("");
  }, []);

  // Init on size change
  useEffect(() => { reset(size); }, [size, reset]);

  // ── Timer tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "playing") {
      tickRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase]);

  // ── Load leaderboard ───────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kt-lb-v2");
      if (raw) setLb(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // ── Derived: valid moves from current position ─────────────────────────────
  const validMoves: [number, number][] =
    pos && phase === "playing" ? getMoves(pos[0], pos[1], vis, size) : [];

  // ── Cell click ─────────────────────────────────────────────────────────────
  const handleClick = useCallback(
    (r: number, c: number) => {
      if (phase === "placing") {
        const v: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
        v[r][c] = true;
        const p: [number, number] = [r, c];
        setVis(v);
        setOrder([p]);
        setPos(p);
        setStart(p);
        setPhase("playing");
        setHintCell(warnsdorff(r, c, v, size));
        return;
      }

      if (phase !== "playing" || !pos) return;
      if (!validMoves.some(([vr, vc]) => vr === r && vc === c)) return;

      // Save snapshot for undo
      setHist((h) => [...h, { pos, vis: vis.map((row) => [...row]), order: [...order] }]);

      const nv = vis.map((row) => [...row]);
      nv[r][c] = true;
      const np: [number, number] = [r, c];
      const nOrder: [number, number][] = [...order, np];
      const total = size * size;
      const nextMoves = getMoves(r, c, nv, size);

      setVis(nv);
      setOrder(nOrder);
      setPos(np);
      setHintCell(warnsdorff(r, c, nv, size));
      setShowHint(false);

      if (nOrder.length === total) {
        // ── Complete tour ───────────────────────────────────────────
        if (tickRef.current) clearInterval(tickRef.current);
        const closed = start
          ? DELTAS.some(([dr, dc]) => r + dr === start[0] && c + dc === start[1])
          : false;
        const sc = closed ? 3 : 2;
        const lbl = closed ? "Closed Tour" : "Open Tour";
        setScore(sc);
        setScoreLabel(lbl);
        setResultMsg(
          closed
            ? "Perfect! The knight returned to its starting square."
            : "Excellent! Every square visited — an open tour."
        );
        setPhase("done");
        setShowNameDlg(true);
      } else if (nextMoves.length === 0) {
        // ── Stuck ──────────────────────────────────────────────────
        if (tickRef.current) clearInterval(tickRef.current);
        const visited = nOrder.length;
        const sc = parseFloat((visited / total).toFixed(4));
        const lbl = `${visited} / ${total}`;
        setScore(sc);
        setScoreLabel(lbl);
        setResultMsg(`No more moves available — ${visited} of ${total} squares visited.`);
        setPhase("done");
        setShowNameDlg(true);
      }
    },
    [phase, size, pos, vis, order, validMoves, start]
  );

  // ── Undo ───────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!hist.length || phase !== "playing") return;
    const snap = hist[hist.length - 1];
    setHist((h) => h.slice(0, -1));
    setVis(snap.vis);
    setOrder(snap.order);
    setPos(snap.pos);
    setHintCell(warnsdorff(snap.pos[0], snap.pos[1], snap.vis, size));
    setShowHint(false);
  }, [hist, phase, size]);

  // ── Hint button ────────────────────────────────────────────────────────────
  const onHint = () => {
    setShowHint(true);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(false), 3500);
  };

  // ── Save to leaderboard ────────────────────────────────────────────────────
  const saveEntry = (name: string) => {
    const entry: LBEntry = {
      name: name.trim() || "Anonymous",
      score,
      label: scoreLabel,
      moves: order.length,
      secs,
      size,
      date: new Date().toLocaleDateString(),
    };
    const next = [...lb, entry]
      .sort((a, b) => b.score - a.score || a.secs - b.secs)
      .slice(0, 30);
    setLb(next);
    try { localStorage.setItem("kt-lb-v2", JSON.stringify(next)); } catch { /* ignore */ }
    setShowNameDlg(false);
    setShowLb(true);
  };

  // ── Board metrics ──────────────────────────────────────────────────────────
  const total = size * size;
  const progress = total > 0 ? order.length / total : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-400 mb-2">
            <span>Game</span>
            <ChevronRight size={11} />
            <span className="text-sky-400">Knight&apos;s Tour</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Knight&apos;s Tour
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Move a chess knight to every square exactly once using only{" "}
            <span className="font-mono text-sky-400">L-shaped</span> jumps.
            Hints use{" "}
            <span className="font-mono text-amber-400">Warnsdorff&apos;s heuristic</span>
            {" "}— always move to the square with the fewest onward moves.
          </p>
        </div>

        {/* ── Main two-column layout ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Board section ───────────────────────────────────────────── */}
          <div className="w-full lg:flex-1 min-w-0">

            {/* Board size selector + status row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Size
                </span>
                {([6, 7, 8] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setSize(n)}
                    className={`rounded-lg px-3 py-1 font-mono text-xs transition-all ${
                      size === n
                        ? "bg-sky-400/20 text-sky-400 border border-sky-400/40 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    {n}×{n}
                  </button>
                ))}
              </div>
              {/* Timer */}
              <div className="flex items-center gap-1.5 font-mono text-sm text-slate-400">
                <TimerIcon size={13} />
                <span>{fmtTime(secs)}</span>
              </div>
            </div>

            {/* Status message */}
            <div className="mb-2 h-5 text-sm">
              {phase === "placing" && (
                <span className="text-slate-500 dark:text-slate-400">
                  ↓ Click any square to place the knight
                </span>
              )}
              {phase === "playing" && (
                <span className="text-slate-500 dark:text-slate-400">
                  {order.length}{" "}
                  <span className="text-slate-600 dark:text-slate-500">/ {total}</span>
                  {" "}squares visited
                </span>
              )}
              {phase === "done" && (
                <span className={score >= 2 ? "text-emerald-400" : "text-amber-400"}>
                  {resultMsg}
                </span>
              )}
            </div>

            {/* ── The chessboard ───────────────────────────────────────── */}
            <div className="flex gap-1">

              {/* Rank labels (8→1) */}
              <div className="flex flex-col shrink-0" style={{ width: 18 }}>
                {Array.from({ length: size }, (_, r) => (
                  <div
                    key={r}
                    className="flex flex-1 items-center justify-center font-mono text-[10px] text-slate-500"
                  >
                    {size - r}
                  </div>
                ))}
              </div>

              {/* Board + file labels */}
              <div className="flex-1 min-w-0">
                {/* Grid */}
                <div
                  className="w-full aspect-square rounded-lg border border-slate-700/40 overflow-hidden"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                    gridTemplateRows: `repeat(${size}, 1fr)`,
                  }}
                >
                  {Array.from({ length: size * size }, (_, idx) => {
                    const r = Math.floor(idx / size);
                    const c = idx % size;
                    const isLight      = (r + c) % 2 === 0;
                    const isKnight     = pos?.[0] === r && pos?.[1] === c;
                    const isStart      = start?.[0] === r && start?.[1] === c;
                    const isVisited    = !!vis[r]?.[c];
                    const moveIdx      = order.findIndex(([or, oc]) => or === r && oc === c);
                    const isValidMove  = validMoves.some(([vr, vc]) => vr === r && vc === c);
                    const isHintCell   = showHint && hintCell?.[0] === r && hintCell?.[1] === c;
                    const canClick     = phase === "placing" || isValidMove;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleClick(r, c)}
                        className={`
                          relative flex items-center justify-center select-none overflow-hidden
                          transition-[filter] duration-100
                          ${isLight
                            ? "bg-slate-200 dark:bg-slate-600"
                            : "bg-slate-400 dark:bg-slate-800"
                          }
                          ${canClick ? "cursor-pointer hover:brightness-110 active:brightness-95" : ""}
                        `}
                      >
                        {/* Visited overlay */}
                        {isVisited && (
                          <div
                            className={`absolute inset-0 ${
                              isStart
                                ? "bg-violet-500/35"
                                : "bg-sky-500/25"
                            }`}
                          />
                        )}

                        {/* Valid move highlight */}
                        {isValidMove && !isHintCell && (
                          <div className="absolute inset-0 bg-sky-400/15 ring-2 ring-inset ring-sky-400/70" />
                        )}

                        {/* Hint highlight (amber pulse) */}
                        {isHintCell && (
                          <motion.div
                            className="absolute inset-0 bg-amber-400/20 ring-2 ring-inset ring-amber-400"
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                          />
                        )}

                        {/* Move order number */}
                        {isVisited && moveIdx >= 0 && (
                          <span
                            className={`absolute left-[3px] top-[2px] font-mono leading-none ${
                              isKnight
                                ? "text-white/70"
                                : "text-slate-700 dark:text-slate-300/80"
                            }`}
                            style={{ fontSize: "clamp(7px, 1.4vw, 10px)" }}
                          >
                            {moveIdx + 1}
                          </span>
                        )}

                        {/* Notation hint on valid-move cells */}
                        {isValidMove && !isVisited && (
                          <span
                            className="absolute bottom-[2px] right-[3px] font-mono leading-none text-slate-500/70"
                            style={{ fontSize: "clamp(6px, 1.1vw, 9px)" }}
                          >
                            {notation(r, c, size)}
                          </span>
                        )}

                        {/* Valid move dot */}
                        {isValidMove && !isHintCell && (
                          <div className="w-[22%] h-[22%] rounded-full bg-sky-400/55 z-10" />
                        )}

                        {/* Hint dot */}
                        {isHintCell && (
                          <motion.div
                            className="w-[28%] h-[28%] rounded-full bg-amber-400/75 z-10"
                            animate={{ scale: [1, 1.25, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                          />
                        )}

                        {/* Knight piece — shared layoutId for move animation */}
                        {isKnight && (
                          <motion.div
                            layoutId="knight-piece"
                            className="absolute inset-0 flex items-center justify-center z-20"
                            transition={{ type: "spring", bounce: 0.25, duration: 0.38 }}
                          >
                            <span
                              className="drop-shadow-lg select-none"
                              role="img"
                              aria-label="knight"
                              style={{ fontSize: "clamp(14px, 4vw, 30px)" }}
                            >
                              ♞
                            </span>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* File labels (a–h) */}
                <div className="flex mt-1">
                  {Array.from({ length: size }, (_, c) => (
                    <div
                      key={c}
                      className="flex-1 text-center font-mono text-[10px] text-slate-500"
                    >
                      {String.fromCharCode(97 + c)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Controls panel ──────────────────────────────────────────── */}
          <div className="w-full lg:w-60 xl:w-64 flex flex-col gap-3 lg:sticky lg:top-6">

            {/* Score card */}
            <div className="rounded-xl border border-slate-200/60 bg-white/60 dark:border-slate-700/40 dark:bg-slate-800/30 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                Score
              </div>
              <div className="flex items-end gap-2">
                <span
                  className={`font-mono font-bold leading-none ${
                    score === 3
                      ? "text-emerald-400 text-5xl"
                      : score === 2
                      ? "text-sky-400 text-5xl"
                      : score > 0
                      ? "text-amber-400 text-3xl"
                      : "text-slate-500 text-5xl"
                  }`}
                >
                  {phase === "done"
                    ? score >= 1
                      ? score.toString()
                      : scoreLabel
                    : phase === "playing"
                    ? order.length
                    : "—"}
                </span>
                {phase === "done" && score >= 1 && (
                  <span className="text-slate-400 text-sm mb-0.5">pts</span>
                )}
              </div>
              {scoreLabel && phase === "done" && (
                <div
                  className={`mt-1 font-mono text-xs ${
                    score === 3
                      ? "text-emerald-400"
                      : score === 2
                      ? "text-sky-400"
                      : "text-amber-400"
                  }`}
                >
                  {scoreLabel}
                </div>
              )}
              {/* Progress bar */}
              {phase === "playing" && (
                <div className="mt-3 h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-sky-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {/* Hint */}
              <button
                onClick={onHint}
                disabled={phase !== "playing" || !hintCell}
                className="flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-2.5 text-sm text-amber-400 transition-colors hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Lightbulb size={14} />
                Warnsdorff Hint
              </button>

              {/* Undo */}
              <button
                onClick={undo}
                disabled={hist.length === 0 || phase !== "playing"}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Undo2 size={14} />
                Undo
                {hist.length > 0 && (
                  <span className="ml-auto font-mono text-xs text-slate-400">
                    ×{hist.length}
                  </span>
                )}
              </button>

              {/* New game */}
              <button
                onClick={() => reset(size)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30"
              >
                <RotateCcw size={14} />
                New Game
              </button>

              {/* Leaderboard */}
              <button
                onClick={() => setShowLb(true)}
                className="flex items-center gap-2.5 rounded-xl border border-violet-400/30 bg-violet-400/5 px-4 py-2.5 text-sm text-violet-400 transition-colors hover:bg-violet-400/10"
              >
                <Trophy size={14} />
                Leaderboard
                {lb.length > 0 && (
                  <span className="ml-auto font-mono text-xs text-slate-500">
                    {lb.length}
                  </span>
                )}
              </button>
            </div>

            {/* Legend */}
            <div className="rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                Legend
              </div>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                {[
                  { color: "bg-sky-500/25", label: "Visited square" },
                  { color: "bg-violet-500/35", label: "Start square" },
                  { ring: "ring-2 ring-sky-400/70", dot: "bg-sky-400/55", label: "Valid move" },
                  { ring: "ring-2 ring-amber-400", dot: "bg-amber-400/75", label: "Warnsdorff hint" },
                ].map(({ color, ring, dot, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded shrink-0 bg-slate-300 dark:bg-slate-600 relative overflow-hidden ${ring ?? ""}`}>
                      {color && <div className={`absolute inset-0 ${color}`} />}
                      {dot && (
                        <div className={`absolute inset-[25%] rounded-full ${dot}`} />
                      )}
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-center text-base leading-none">♞</span>
                  <span>Knight (current)</span>
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                Scoring
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-slate-600 dark:text-slate-300">Closed Tour</div>
                    <div className="text-slate-400 text-[10px]">All squares + return to start</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">3 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-slate-600 dark:text-slate-300">Open Tour</div>
                    <div className="text-slate-400 text-[10px]">All squares visited</div>
                  </div>
                  <span className="font-mono font-bold text-sky-400">2 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-slate-600 dark:text-slate-300">Partial</div>
                    <div className="text-slate-400 text-[10px]">As many as you can</div>
                  </div>
                  <span className="font-mono font-bold text-amber-400">X/{total}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex gap-2 rounded-xl border border-slate-200/40 bg-slate-50/50 dark:border-slate-700/30 dark:bg-slate-800/10 p-3 text-xs text-slate-500">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>
                Warnsdorff&apos;s rule (1823) solves the tour in linear time. On 8×8,
                both closed and open tours exist starting from any square.
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Name / result dialog ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showNameDlg && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl"
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            >
              {/* Result header */}
              <div
                className={`mb-1 text-2xl font-bold ${
                  score === 3
                    ? "text-emerald-400"
                    : score === 2
                    ? "text-sky-400"
                    : "text-amber-400"
                }`}
              >
                {score === 3
                  ? "♞ Closed Tour!"
                  : score === 2
                  ? "♞ Open Tour!"
                  : `♞ ${scoreLabel}`}
              </div>
              <p className="mb-1 text-sm text-slate-400">{resultMsg}</p>
              <p className="mb-5 font-mono text-xs text-slate-500">
                Time: {fmtTime(secs)} · Moves: {order.length}
              </p>

              {/* Name input */}
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Your name for the leaderboard
              </label>
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEntry(nameInput)}
                placeholder="Anonymous"
                className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-400/60"
              />

              <div className="flex gap-2.5">
                <button
                  onClick={() => saveEntry(nameInput)}
                  className="flex-1 rounded-xl bg-sky-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-400"
                >
                  Save &amp; View Leaderboard
                </button>
                <button
                  onClick={() => { setShowNameDlg(false); reset(size); }}
                  className="rounded-xl border border-slate-700 px-4 text-sm text-slate-400 transition-colors hover:text-slate-200"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Leaderboard modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLb && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLb(false)}
          >
            <motion.div
              className="flex w-full max-w-md flex-col rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl"
              style={{ maxHeight: "80vh" }}
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400" />
                  <span className="font-semibold text-slate-100">Leaderboard</span>
                </div>
                <button
                  onClick={() => setShowLb(false)}
                  className="text-slate-500 transition-colors hover:text-slate-200"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Entries */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {lb.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-600">
                    No entries yet — complete a tour to be first!
                  </div>
                ) : (
                  lb.map((e, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl p-3 ${
                        i === 0
                          ? "border border-amber-400/25 bg-amber-400/8"
                          : "bg-slate-800/40"
                      }`}
                    >
                      {/* Rank */}
                      <span className="w-6 shrink-0 text-center font-mono text-sm">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                          <span className="text-slate-600">{i + 1}</span>
                        )}
                      </span>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm text-slate-200">{e.name}</div>
                        <div className="font-mono text-[10px] text-slate-600">
                          {e.label} · {e.size}×{e.size} · {e.date}
                        </div>
                      </div>

                      {/* Score + time */}
                      <div className="shrink-0 text-right">
                        <div
                          className={`font-mono text-sm font-bold ${
                            e.score === 3
                              ? "text-emerald-400"
                              : e.score === 2
                              ? "text-sky-400"
                              : "text-amber-400"
                          }`}
                        >
                          {e.score >= 1 ? `${e.score} pts` : e.label}
                        </div>
                        <div className="font-mono text-[10px] text-slate-600">
                          {fmtTime(e.secs)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 px-5 py-3 flex justify-between items-center">
                <span className="font-mono text-[10px] text-slate-600">
                  Sorted by score, then time
                </span>
                {lb.length > 0 && (
                  <button
                    onClick={() => {
                      setLb([]);
                      try { localStorage.removeItem("kt-lb-v2"); } catch { /* ignore */ }
                    }}
                    className="font-mono text-[10px] text-slate-700 transition-colors hover:text-slate-400"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
