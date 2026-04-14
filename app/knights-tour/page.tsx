"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Undo2, Trophy, Lightbulb, X, Timer as TimerIcon,
  ChevronRight, Info, Lock, Trash2, Plus, ShieldCheck, AlertCircle,
  Check,
} from "lucide-react";
import Footer from "@/components/Footer";

// ─── Content filter ───────────────────────────────────────────────────────────
// Checked on name submit — patterns cover common EN + TR offensive words.
// Source is visible (open-source) but the list is intentionally brief.
const BLOCKED: RegExp[] = [
  /\b(fuck|shit|bitch|cunt|dick|pussy|cock|piss|bastard|whore|slut)\b/i,
  /\b(nigger|faggot|retard)\b/i,
  /\b(orospu|piç|yarrak|göt|amk|sik(iş)?|bok|kahpe|oç|ibne|dalyarak)\b/i,
];

function checkName(name: string): { ok: boolean; reason?: string } {
  if (name.trim().length > 32) return { ok: false, reason: "Max 32 characters." };
  if (BLOCKED.some((r) => r.test(name))) return { ok: false, reason: "Inappropriate content." };
  return { ok: true };
}

// ─── SHA-256 (Web Crypto API — no npm dep) ────────────────────────────────────
async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Hash lives in .env.local as NEXT_PUBLIC_KT_ADMIN_HASH (gitignored).
// Only the hash is in the bundle — never the plaintext password.
const ADMIN_HASH = (process.env.NEXT_PUBLIC_KT_ADMIN_HASH ?? "").toLowerCase();

// ─── Knight logic ─────────────────────────────────────────────────────────────
const DELTAS: [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2],  [1, 2],  [2, -1],  [2, 1],
];

function getMoves(r: number, c: number, vis: boolean[][], n: number): [number, number][] {
  return DELTAS
    .map(([dr, dc]): [number, number] => [r + dr, c + dc])
    .filter(([nr, nc]) => nr >= 0 && nr < n && nc >= 0 && nc < n && !vis[nr][nc]);
}

function warnsdorff(r: number, c: number, vis: boolean[][], n: number): [number, number] | null {
  const moves = getMoves(r, c, vis, n);
  if (!moves.length) return null;
  return [...moves].sort((a, b) => {
    const da = getMoves(a[0], a[1], vis, n).length;
    const db = getMoves(b[0], b[1], vis, n).length;
    if (da !== db) return da - db;
    // secondary lookahead for tie-breaking
    const sa = getMoves(a[0], a[1], vis, n).reduce((acc, [nr, nc]) => acc + getMoves(nr, nc, vis, n).length, 0);
    const sb = getMoves(b[0], b[1], vis, n).reduce((acc, [nr, nc]) => acc + getMoves(nr, nc, vis, n).length, 0);
    return sa - sb;
  })[0];
}

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
  score: number;          // 3 | 2 | fraction
  label: string;          // "Closed Tour" | "Open Tour" | "X / N"
  moves: number;
  secs: number;
  size: number;
  date: string;
}

type ChallengeCategory = "standard" | "advanced" | "expert";
type ChallengeStatus    = "pending" | "approved" | "rejected";

interface BoardChallenge {
  id: string;
  title: string;
  size: number;
  startRow: number | null;  // null = player chooses freely
  startCol: number | null;
  description: string;
  submittedAt: string;
  status: ChallengeStatus;
  category: ChallengeCategory;
}

type Phase    = "placing" | "playing" | "done";
type AdminTab = "scores" | "challenges";

// ─── Component ────────────────────────────────────────────────────────────────

export default function KnightsTourPage() {

  // ── Game ────────────────────────────────────────────────────────────────────
  const [size, setSize]       = useState(8);
  const [vis, setVis]         = useState<boolean[][]>([]);
  const [order, setOrder]     = useState<[number, number][]>([]);
  const [pos, setPos]         = useState<[number, number] | null>(null);
  const [start, setStart]     = useState<[number, number] | null>(null);
  const [phase, setPhase]     = useState<Phase>("placing");
  const [hist, setHist]       = useState<Snapshot[]>([]);
  const [hintCell, setHintCell]   = useState<[number, number] | null>(null);
  const [showHint, setShowHint]   = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick      = useRef<ReturnType<typeof setInterval> | null>(null);
  const [secs, setSecs]       = useState(0);
  const [score, setScore]     = useState(0);
  const [scoreLabel, setScoreLabel] = useState("");
  const [resultMsg, setResultMsg]   = useState("");

  // ref for community-board auto-placement
  const autoPlace = useRef<{ row: number; col: number } | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // ── Admin ───────────────────────────────────────────────────────────────────
  const [adminMode, setAdminMode]         = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPw, setAdminPw]             = useState("");
  const [adminPwErr, setAdminPwErr]       = useState("");
  const [adminTab, setAdminTab]           = useState<AdminTab>("scores");

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  const [lb, setLb]                   = useState<LBEntry[]>([]);
  const [showLb, setShowLb]           = useState(false);
  const [nameInput, setNameInput]     = useState("");
  const [nameErr, setNameErr]         = useState("");
  const [showNameDlg, setShowNameDlg] = useState(false);

  // ── Sandbox ─────────────────────────────────────────────────────────────────
  const [challenges, setChallenges]       = useState<BoardChallenge[]>([]);
  const [showSandbox, setShowSandbox]     = useState(false);
  const [cfTitle, setCfTitle]             = useState("");
  const [cfSize, setCfSize]               = useState(9);
  const [cfDesc, setCfDesc]               = useState("");
  const [cfFixed, setCfFixed]             = useState(false);
  const [cfRow, setCfRow]                 = useState(0);
  const [cfCol, setCfCol]                 = useState(0);

  const communityBoards = challenges.filter((c) => c.status === "approved");
  const pendingCount    = challenges.filter((c) => c.status === "pending").length;

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = useCallback((n: number) => {
    if (tick.current)      clearInterval(tick.current);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setVis(Array.from({ length: n }, () => Array(n).fill(false)));
    setOrder([]);  setPos(null);   setStart(null);
    setPhase("placing");           setHist([]);
    setHintCell(null);             setShowHint(false);
    setSecs(0);   setScore(0);    setScoreLabel("");  setResultMsg("");
    setNameInput(""); setNameErr("");
    setSelectedBoardId(null);
  }, []);

  useEffect(() => { reset(size); }, [size, reset]);

  // Auto-place after reset (community boards with fixed start)
  useEffect(() => {
    if (phase === "placing" && autoPlace.current && vis.length === size) {
      const { row, col } = autoPlace.current;
      autoPlace.current = null;
      const v: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
      v[row][col] = true;
      const p: [number, number] = [row, col];
      setVis(v); setOrder([p]); setPos(p); setStart(p);
      setPhase("playing");
      setHintCell(warnsdorff(row, col, v, size));
    }
  }, [phase, vis, size]);

  // Timer
  useEffect(() => {
    if (phase === "playing") {
      tick.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } else {
      if (tick.current) clearInterval(tick.current);
    }
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [phase]);

  // Load persisted data
  useEffect(() => {
    try { const r = localStorage.getItem("kt-lb-v2");      if (r) setLb(JSON.parse(r)); }         catch { /* */ }
    try { const r = localStorage.getItem("kt-sandbox-v1"); if (r) setChallenges(JSON.parse(r)); }  catch { /* */ }
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const validMoves: [number, number][] =
    pos && phase === "playing" ? getMoves(pos[0], pos[1], vis, size) : [];
  const total    = size * size;
  const progress = total > 0 ? order.length / total : 0;

  // ── Cell click ──────────────────────────────────────────────────────────────
  const handleClick = useCallback((r: number, c: number) => {
    if (phase === "placing") {
      const v: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
      v[r][c] = true;
      const p: [number, number] = [r, c];
      setVis(v); setOrder([p]); setPos(p); setStart(p);
      setPhase("playing");
      setHintCell(warnsdorff(r, c, v, size));
      return;
    }
    if (phase !== "playing" || !pos) return;
    if (!validMoves.some(([vr, vc]) => vr === r && vc === c)) return;

    setHist((h) => [...h, { pos, vis: vis.map((row) => [...row]), order: [...order] }]);

    const nv = vis.map((row) => [...row]);
    nv[r][c] = true;
    const np: [number, number]       = [r, c];
    const nOrder: [number, number][] = [...order, np];
    const nextMoves                  = getMoves(r, c, nv, size);

    setVis(nv); setOrder(nOrder); setPos(np);
    setHintCell(warnsdorff(r, c, nv, size));
    setShowHint(false);

    if (nOrder.length === total) {
      if (tick.current) clearInterval(tick.current);
      const closed = start
        ? DELTAS.some(([dr, dc]) => r + dr === start[0] && c + dc === start[1])
        : false;
      const sc  = closed ? 3 : 2;
      const lbl = closed ? "Closed Tour" : "Open Tour";
      setScore(sc); setScoreLabel(lbl);
      setResultMsg(closed
        ? "Perfect! The knight returned to its starting square."
        : "Excellent! Every square visited — an open tour.");
      setPhase("done"); setShowNameDlg(true);
    } else if (nextMoves.length === 0) {
      if (tick.current) clearInterval(tick.current);
      const visited = nOrder.length;
      setScore(parseFloat((visited / total).toFixed(4)));
      setScoreLabel(`${visited} / ${total}`);
      setResultMsg(`No more moves — ${visited} of ${total} squares visited.`);
      setPhase("done"); setShowNameDlg(true);
    }
  }, [phase, size, pos, vis, order, validMoves, start, total]);

  // ── Undo ────────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!hist.length || phase !== "playing") return;
    const snap = hist[hist.length - 1];
    setHist((h) => h.slice(0, -1));
    setVis(snap.vis); setOrder(snap.order); setPos(snap.pos);
    setHintCell(warnsdorff(snap.pos[0], snap.pos[1], snap.vis, size));
    setShowHint(false);
  }, [hist, phase, size]);

  const onHint = () => {
    setShowHint(true);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setShowHint(false), 3500);
  };

  // ── Admin ───────────────────────────────────────────────────────────────────
  const tryLogin = async () => {
    if (!ADMIN_HASH) { setAdminPwErr("NEXT_PUBLIC_KT_ADMIN_HASH is not set in .env.local."); return; }
    const hash = await sha256(adminPw);
    if (hash === ADMIN_HASH) {
      setAdminMode(true); setShowAdminLogin(false);
      setAdminPw(""); setAdminPwErr("");
    } else {
      setAdminPwErr("Incorrect password.");
    }
  };

  // ── Leaderboard ops ─────────────────────────────────────────────────────────
  const saveLB = (next: LBEntry[]) => {
    setLb(next);
    try { localStorage.setItem("kt-lb-v2", JSON.stringify(next)); } catch { /* */ }
  };

  const saveEntry = (name: string) => {
    const chk = checkName(name);
    if (!chk.ok) { setNameErr(chk.reason!); return; }
    const entry: LBEntry = {
      name: name.trim() || "Anonymous", score, label: scoreLabel,
      moves: order.length, secs, size, date: new Date().toLocaleDateString(),
    };
    saveLB([...lb, entry].sort((a, b) => b.score - a.score || a.secs - b.secs).slice(0, 30));
    setShowNameDlg(false); setShowLb(true);
  };

  // ── Sandbox ops ─────────────────────────────────────────────────────────────
  const saveChallenges = (next: BoardChallenge[]) => {
    setChallenges(next);
    try { localStorage.setItem("kt-sandbox-v1", JSON.stringify(next)); } catch { /* */ }
  };

  const submitChallenge = () => {
    const ch: BoardChallenge = {
      id:          Math.random().toString(36).slice(2),
      title:       cfTitle.trim() || `${cfSize}×${cfSize} Challenge`,
      size:        cfSize,
      startRow:    cfFixed ? cfRow : null,
      startCol:    cfFixed ? cfCol : null,
      description: cfDesc.trim(),
      submittedAt: new Date().toISOString(),
      status:      "pending",
      category:    "standard",
    };
    saveChallenges([...challenges, ch]);
    setShowSandbox(false);
    setCfTitle(""); setCfDesc(""); setCfFixed(false);
  };

  const reviewChallenge = (id: string, status: ChallengeStatus, cat?: ChallengeCategory) => {
    saveChallenges(challenges.map((c) => c.id === id ? { ...c, status, category: cat ?? c.category } : c));
  };

  const deleteChallenge = (id: string) => saveChallenges(challenges.filter((c) => c.id !== id));

  const playCommunityBoard = (board: BoardChallenge) => {
    setSelectedBoardId(board.id);
    if (board.startRow !== null && board.startCol !== null) {
      autoPlace.current = { row: board.startRow, col: board.startCol };
    }
    if (size === board.size) { reset(board.size); } else { setSize(board.size); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-400 mb-2">
            <span>Game</span><ChevronRight size={11} /><span className="text-sky-400">Knight&apos;s Tour</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Knight&apos;s Tour</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Move a chess knight to every square exactly once using{" "}
            <span className="font-mono text-sky-400">L-shaped</span> jumps.
            Hints use <span className="font-mono text-amber-400">Warnsdorff&apos;s heuristic</span>.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Board section ─────────────────────────────────────────────── */}
          <div className="w-full lg:flex-1 min-w-0">

            {/* Size selector row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Standard</span>
                {([6, 7, 8] as const).map((n) => (
                  <button key={n}
                    onClick={() => { setSize(n); setSelectedBoardId(null); }}
                    className={`rounded-lg px-3 py-1 font-mono text-xs transition-all ${
                      size === n && !selectedBoardId
                        ? "bg-sky-400/20 text-sky-400 border border-sky-400/40"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >{n}×{n}</button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 font-mono text-sm text-slate-400">
                <TimerIcon size={13} /><span>{fmtTime(secs)}</span>
              </div>
            </div>

            {/* Community boards */}
            {communityBoards.length > 0 && (
              <div className="mb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mr-2">Community</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {communityBoards.map((board) => (
                    <button key={board.id} onClick={() => playCommunityBoard(board)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                        selectedBoardId === board.id
                          ? board.category === "expert"  ? "border-rose-400   bg-rose-400/15  text-rose-400"
                          : board.category === "advanced"? "border-amber-400  bg-amber-400/15 text-amber-400"
                          :                                "border-emerald-400 bg-emerald-400/15 text-emerald-400"
                          : board.category === "expert"  ? "border-rose-400/30   bg-rose-400/5   text-rose-400/80   hover:bg-rose-400/10"
                          : board.category === "advanced"? "border-amber-400/30  bg-amber-400/5  text-amber-400/80  hover:bg-amber-400/10"
                          :                                "border-emerald-400/30 bg-emerald-400/5 text-emerald-400/80 hover:bg-emerald-400/10"
                      }`}
                    >
                      {board.category === "expert" ? "⭐" : board.category === "advanced" ? "⚡" : "✓"}
                      <span className="font-medium">{board.title}</span>
                      <span className="opacity-60 font-mono">{board.size}×{board.size}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mb-2 h-5 text-sm">
              {phase === "placing" && <span className="text-slate-500 dark:text-slate-400">↓ Click any square to place the knight</span>}
              {phase === "playing" && <span className="text-slate-500 dark:text-slate-400">{order.length} <span className="opacity-60">/ {total}</span> squares</span>}
              {phase === "done"    && <span className={score >= 2 ? "text-emerald-400" : "text-amber-400"}>{resultMsg}</span>}
            </div>

            {/* Board */}
            <div className="flex gap-1">
              {/* Rank labels */}
              <div className="flex flex-col shrink-0" style={{ width: 18 }}>
                {Array.from({ length: size }, (_, r) => (
                  <div key={r} className="flex flex-1 items-center justify-center font-mono text-[10px] text-slate-500">{size - r}</div>
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="w-full aspect-square rounded-lg border border-slate-700/40 overflow-hidden"
                  style={{ display: "grid", gridTemplateColumns: `repeat(${size},1fr)`, gridTemplateRows: `repeat(${size},1fr)` }}
                >
                  {Array.from({ length: size * size }, (_, idx) => {
                    const r = Math.floor(idx / size), c = idx % size;
                    const isLight     = (r + c) % 2 === 0;
                    const isKnight    = pos?.[0] === r && pos?.[1] === c;
                    const isStart     = start?.[0] === r && start?.[1] === c;
                    const isVisited   = !!vis[r]?.[c];
                    const moveIdx     = order.findIndex(([or, oc]) => or === r && oc === c);
                    const isValid     = validMoves.some(([vr, vc]) => vr === r && vc === c);
                    const isHintCell  = showHint && hintCell?.[0] === r && hintCell?.[1] === c;
                    const canClick    = phase === "placing" || isValid;

                    return (
                      <div key={idx} onClick={() => handleClick(r, c)}
                        className={`
                          relative flex items-center justify-center select-none overflow-hidden transition-[filter] duration-100
                          ${isLight ? "bg-slate-200 dark:bg-slate-600" : "bg-slate-400 dark:bg-slate-800"}
                          ${canClick ? "cursor-pointer hover:brightness-110 active:brightness-95" : ""}
                        `}
                      >
                        {isVisited && (
                          <div className={`absolute inset-0 ${isStart ? "bg-violet-500/35" : "bg-sky-500/25"}`} />
                        )}
                        {isValid && !isHintCell && (
                          <div className="absolute inset-0 bg-sky-400/15 ring-2 ring-inset ring-sky-400/70" />
                        )}
                        {isHintCell && (
                          <motion.div className="absolute inset-0 bg-amber-400/20 ring-2 ring-inset ring-amber-400"
                            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.2 }} />
                        )}
                        {isVisited && moveIdx >= 0 && (
                          <span className={`absolute left-[3px] top-[2px] font-mono leading-none ${isKnight ? "text-white/70" : "text-slate-700 dark:text-slate-300/80"}`}
                            style={{ fontSize: "clamp(7px,1.4vw,10px)" }}>
                            {moveIdx + 1}
                          </span>
                        )}
                        {isValid && !isVisited && (
                          <span className="absolute bottom-[2px] right-[3px] font-mono leading-none text-slate-500/70"
                            style={{ fontSize: "clamp(6px,1.1vw,9px)" }}>
                            {notation(r, c, size)}
                          </span>
                        )}
                        {isValid && !isHintCell && <div className="w-[22%] h-[22%] rounded-full bg-sky-400/55 z-10" />}
                        {isHintCell && (
                          <motion.div className="w-[28%] h-[28%] rounded-full bg-amber-400/75 z-10"
                            animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} />
                        )}
                        {isKnight && (
                          <motion.div layoutId="knight-piece" className="absolute inset-0 flex items-center justify-center z-20"
                            transition={{ type: "spring", bounce: 0.25, duration: 0.38 }}>
                            <span className="drop-shadow-lg select-none" role="img" aria-label="knight"
                              style={{ fontSize: "clamp(14px,4vw,30px)" }}>♞</span>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* File labels */}
                <div className="flex mt-1">
                  {Array.from({ length: size }, (_, c) => (
                    <div key={c} className="flex-1 text-center font-mono text-[10px] text-slate-500">
                      {String.fromCharCode(97 + c)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Controls panel ────────────────────────────────────────────── */}
          <div className="w-full lg:w-60 xl:w-64 flex flex-col gap-3 lg:sticky lg:top-6">

            {/* Score */}
            <div className="rounded-xl border border-slate-200/60 bg-white/60 dark:border-slate-700/40 dark:bg-slate-800/30 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Score</div>
              <div className="flex items-end gap-2">
                <span className={`font-mono font-bold leading-none ${
                  score === 3 ? "text-emerald-400 text-5xl" : score === 2 ? "text-sky-400 text-5xl"
                  : score > 0 ? "text-amber-400 text-3xl" : "text-slate-500 text-5xl"
                }`}>
                  {phase === "done" ? (score >= 1 ? score.toString() : scoreLabel)
                    : phase === "playing" ? order.length : "—"}
                </span>
                {phase === "done" && score >= 1 && <span className="text-slate-400 text-sm mb-0.5">pts</span>}
              </div>
              {scoreLabel && phase === "done" && (
                <div className={`mt-1 font-mono text-xs ${score === 3 ? "text-emerald-400" : score === 2 ? "text-sky-400" : "text-amber-400"}`}>
                  {scoreLabel}
                </div>
              )}
              {phase === "playing" && (
                <div className="mt-3 h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div className="h-full rounded-full bg-sky-400" initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.3 }} />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button onClick={onHint} disabled={phase !== "playing" || !hintCell}
                className="flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-2.5 text-sm text-amber-400 transition-colors hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-30">
                <Lightbulb size={14} />Warnsdorff Hint
              </button>
              <button onClick={undo} disabled={hist.length === 0 || phase !== "playing"}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:opacity-30">
                <Undo2 size={14} />Undo
                {hist.length > 0 && <span className="ml-auto font-mono text-xs text-slate-400">×{hist.length}</span>}
              </button>
              <button onClick={() => reset(size)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30">
                <RotateCcw size={14} />New Game
              </button>
              <button onClick={() => setShowLb(true)}
                className="flex items-center gap-2.5 rounded-xl border border-violet-400/30 bg-violet-400/5 px-4 py-2.5 text-sm text-violet-400 transition-colors hover:bg-violet-400/10">
                <Trophy size={14} />Leaderboard
                {lb.length > 0 && <span className="ml-auto font-mono text-xs text-slate-500">{lb.length}</span>}
              </button>
              <button onClick={() => setShowSandbox(true)}
                className="flex items-center gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-emerald-400/10">
                <Plus size={14} />Create Challenge
              </button>
              {/* Admin toggle */}
              <button onClick={() => adminMode ? setAdminMode(false) : setShowAdminLogin(true)}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                  adminMode
                    ? "border-rose-400/30 bg-rose-400/5 text-rose-400 hover:bg-rose-400/10"
                    : "border-slate-200/40 dark:border-slate-700/30 text-slate-500 hover:text-slate-400 bg-transparent"
                }`}>
                {adminMode ? <ShieldCheck size={14} /> : <Lock size={14} />}
                {adminMode ? "Admin Active" : "Admin"}
                {adminMode && pendingCount > 0 && (
                  <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 font-mono text-[9px] text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Legend */}
            <div className="rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">Legend</div>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                {[
                  { color: "bg-sky-500/25",    label: "Visited" },
                  { color: "bg-violet-500/35", label: "Start square" },
                  { ring: "ring-2 ring-sky-400/70",  dot: "bg-sky-400/55",  label: "Valid move" },
                  { ring: "ring-2 ring-amber-400",   dot: "bg-amber-400/75",label: "Warnsdorff hint" },
                ].map(({ color, ring, dot, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded shrink-0 bg-slate-300 dark:bg-slate-600 relative overflow-hidden ${ring ?? ""}`}>
                      {color && <div className={`absolute inset-0 ${color}`} />}
                      {dot   && <div className={`absolute inset-[25%] rounded-full ${dot}`} />}
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
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">Scoring</div>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Closed Tour", sub: "All squares + return",   pts: "3 pts", color: "text-emerald-400" },
                  { label: "Open Tour",   sub: "All squares visited",     pts: "2 pts", color: "text-sky-400"     },
                  { label: "Partial",     sub: "As many as you can",      pts: `X/${total}`, color: "text-amber-400"  },
                ].map(({ label, sub, pts, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <div>
                      <div className="text-slate-600 dark:text-slate-300">{label}</div>
                      <div className="text-slate-400 text-[10px]">{sub}</div>
                    </div>
                    <span className={`font-mono font-bold ${color}`}>{pts}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 rounded-xl border border-slate-200/40 bg-slate-50/50 dark:border-slate-700/30 dark:bg-slate-800/10 p-3 text-xs text-slate-500">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>Warnsdorff (1823) solves the tour in linear time. Custom boards: 5–15.</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* ── Name / result dialog ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showNameDlg && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl"
              initial={{ scale: 0.88, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }} transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}>
              <div className={`mb-1 text-2xl font-bold ${score === 3 ? "text-emerald-400" : score === 2 ? "text-sky-400" : "text-amber-400"}`}>
                {score === 3 ? "♞ Closed Tour!" : score === 2 ? "♞ Open Tour!" : `♞ ${scoreLabel}`}
              </div>
              <p className="mb-1 text-sm text-slate-400">{resultMsg}</p>
              <p className="mb-5 font-mono text-xs text-slate-500">Time: {fmtTime(secs)} · Moves: {order.length}</p>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Your name for the leaderboard
              </label>
              <input autoFocus value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setNameErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && saveEntry(nameInput)}
                placeholder="Anonymous"
                className={`mb-1 w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors ${nameErr ? "border-rose-400/60" : "border-slate-700 focus:border-sky-400/60"}`}
              />
              {nameErr && (
                <div className="mb-3 flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle size={12} /><span>{nameErr}</span>
                </div>
              )}
              {!nameErr && <div className="mb-3" />}
              <div className="flex gap-2.5">
                <button onClick={() => saveEntry(nameInput)}
                  className="flex-1 rounded-xl bg-sky-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-400">
                  Save &amp; View Leaderboard
                </button>
                <button onClick={() => { setShowNameDlg(false); reset(size); }}
                  className="rounded-xl border border-slate-700 px-4 text-sm text-slate-400 transition-colors hover:text-slate-200">
                  Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Leaderboard modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLb && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLb(false)}>
            <motion.div className="flex w-full max-w-md flex-col rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl"
              style={{ maxHeight: "82vh" }}
              initial={{ scale: 0.88, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }} transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400" />
                  <span className="font-semibold text-slate-100">Leaderboard</span>
                </div>
                <div className="flex items-center gap-2">
                  {adminMode && (
                    <span className="flex items-center gap-1 rounded-md bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] text-rose-400">
                      <ShieldCheck size={10} />ADMIN
                    </span>
                  )}
                  <button onClick={() => adminMode ? setAdminMode(false) : setShowAdminLogin(true)} title="Admin"
                    className={`rounded-lg p-1.5 transition-colors ${adminMode ? "text-rose-400 hover:bg-rose-400/10" : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"}`}>
                    {adminMode ? <ShieldCheck size={15} /> : <Lock size={15} />}
                  </button>
                  <button onClick={() => setShowLb(false)} className="text-slate-500 transition-colors hover:text-slate-200">
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Admin tabs */}
              {adminMode && (
                <div className="flex border-b border-slate-800 shrink-0">
                  {(["scores", "challenges"] as const).map((tab) => (
                    <button key={tab} onClick={() => setAdminTab(tab)}
                      className={`flex-1 py-2.5 text-xs font-mono transition-colors ${
                        adminTab === tab
                          ? `border-b-2 ${tab === "scores" ? "border-sky-400 text-sky-400" : "border-emerald-400 text-emerald-400"}`
                          : "text-slate-500 hover:text-slate-300"
                      }`}>
                      {tab === "challenges" ? (
                        <span className="flex items-center justify-center gap-1.5">
                          Challenges
                          {pendingCount > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 font-mono text-[9px] text-white">{pendingCount}</span>
                          )}
                        </span>
                      ) : "Scores"}
                    </button>
                  ))}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">

                {/* Scores tab */}
                {(!adminMode || adminTab === "scores") && (
                  lb.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-600">No entries yet.</div>
                  ) : lb.map((e, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${i === 0 ? "border border-amber-400/25 bg-amber-400/[0.06]" : "bg-slate-800/40"}`}>
                      <span className="w-6 shrink-0 text-center font-mono text-sm">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-slate-600">{i + 1}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm text-slate-200">{e.name}</div>
                        <div className="font-mono text-[10px] text-slate-600">{e.label} · {e.size}×{e.size} · {e.date}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`font-mono text-sm font-bold ${e.score === 3 ? "text-emerald-400" : e.score === 2 ? "text-sky-400" : "text-amber-400"}`}>
                          {e.score >= 1 ? `${e.score} pts` : e.label}
                        </div>
                        <div className="font-mono text-[10px] text-slate-600">{fmtTime(e.secs)}</div>
                      </div>
                      {adminMode && (
                        <button onClick={() => saveLB(lb.filter((_, j) => j !== i))}
                          className="ml-1 rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-rose-400/10 hover:text-rose-400">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))
                )}

                {/* Challenges tab (admin only) */}
                {adminMode && adminTab === "challenges" && (
                  challenges.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-600">No challenge submissions yet.</div>
                  ) : challenges.map((ch) => (
                    <div key={ch.id} className={`rounded-xl border p-3 ${
                      ch.status === "approved" ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                      : ch.status === "pending" ? "border-slate-700 bg-slate-800/40"
                      : "border-slate-800 bg-slate-800/20 opacity-50"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200 truncate">{ch.title}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {ch.size}×{ch.size}
                            {ch.startRow !== null ? ` · Start: ${notation(ch.startRow, ch.startCol!, ch.size)}` : " · Free start"}
                            {" · "}{new Date(ch.submittedAt).toLocaleDateString()}
                          </div>
                          {ch.description && <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{ch.description}</p>}
                        </div>
                        <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] ${
                          ch.status === "pending"  ? "bg-amber-400/10 text-amber-400"
                          : ch.status === "approved" ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-slate-700 text-slate-500"
                        }`}>{ch.status}</span>
                      </div>

                      {ch.status === "pending" && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {(["standard", "advanced", "expert"] as const).map((cat) => (
                            <button key={cat} onClick={() => reviewChallenge(ch.id, "approved", cat)}
                              className={`rounded-lg border px-2 py-1 text-[10px] font-mono transition-colors ${
                                cat === "expert"   ? "border-rose-400/30 text-rose-400 hover:bg-rose-400/10"
                                : cat === "advanced" ? "border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                                : "border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                              }`}>
                              <Check size={9} className="inline mr-0.5" />{cat}
                            </button>
                          ))}
                          <button onClick={() => reviewChallenge(ch.id, "rejected")}
                            className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-mono text-slate-500 hover:text-rose-400 transition-colors">
                            Reject
                          </button>
                          <button onClick={() => deleteChallenge(ch.id)} className="ml-auto rounded-lg p-1 text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                      {ch.status === "approved" && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] ${
                            ch.category === "expert"   ? "bg-rose-400/10 text-rose-400"
                            : ch.category === "advanced" ? "bg-amber-400/10 text-amber-400"
                            : "bg-emerald-400/10 text-emerald-400"
                          }`}>{ch.category}</span>
                          <button onClick={() => reviewChallenge(ch.id, "rejected")}
                            className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors">Revoke</button>
                          <button onClick={() => deleteChallenge(ch.id)} className="ml-auto rounded-lg p-1 text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 px-5 py-3 flex justify-between items-center shrink-0">
                <span className="font-mono text-[10px] text-slate-600">Sorted by score, then time</span>
                {adminMode && adminTab === "scores" && lb.length > 0 && (
                  <button onClick={() => saveLB([])} className="font-mono text-[10px] text-slate-600 hover:text-rose-400 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Admin login modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowAdminLogin(false); setAdminPw(""); setAdminPwErr(""); }}>
            <motion.div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={15} className="text-slate-400" />
                <span className="font-semibold text-slate-200">Admin Access</span>
              </div>
              <input autoFocus type="password" value={adminPw}
                onChange={(e) => { setAdminPw(e.target.value); setAdminPwErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && tryLogin()}
                placeholder="Password"
                className={`w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors mb-2 ${adminPwErr ? "border-rose-400/60" : "border-slate-700 focus:border-sky-400/60"}`}
              />
              {adminPwErr && (
                <div className="mb-3 flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle size={11} /><span>{adminPwErr}</span>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={tryLogin}
                  className="flex-1 rounded-xl bg-sky-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-400">
                  Enter
                </button>
                <button onClick={() => { setShowAdminLogin(false); setAdminPw(""); setAdminPwErr(""); }}
                  className="rounded-xl border border-slate-700 px-4 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  Cancel
                </button>
              </div>
              {!ADMIN_HASH && (
                <p className="mt-3 text-center font-mono text-[10px] text-slate-600">
                  Set NEXT_PUBLIC_KT_ADMIN_HASH in .env.local to enable.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create Challenge modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSandbox && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSandbox(false)}>
            <motion.div className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl"
              initial={{ scale: 0.88, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }} transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Plus size={15} className="text-emerald-400" />
                  <span className="font-semibold text-slate-100">Create a Challenge</span>
                </div>
                <button onClick={() => setShowSandbox(false)} className="text-slate-500 hover:text-slate-200"><X size={17} /></button>
              </div>

              {/* Title */}
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500">Title</label>
              <input value={cfTitle} onChange={(e) => setCfTitle(e.target.value)} placeholder={`${cfSize}×${cfSize} Challenge`}
                className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-400/60 transition-colors" />

              {/* Board size */}
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500">Board Size (5–15)</label>
              <div className="flex items-center gap-3 mb-3">
                <input type="number" min={5} max={15} value={cfSize}
                  onChange={(e) => setCfSize(Math.min(15, Math.max(5, parseInt(e.target.value) || 5)))}
                  className="w-20 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center font-mono text-sm text-slate-200 outline-none focus:border-sky-400/60 transition-colors" />
                <span className="text-slate-500 text-sm font-mono">= {cfSize * cfSize} squares</span>
              </div>

              {/* Fixed start toggle */}
              <button onClick={() => setCfFixed(!cfFixed)}
                className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors ${cfFixed ? "border-sky-400/40 bg-sky-400/10 text-sky-400" : "border-slate-700 text-slate-500 hover:text-slate-300"}`}>
                {cfFixed ? <Check size={11} /> : <Plus size={11} />}
                Fixed start position
              </button>

              {cfFixed && (
                <div className="mb-3 flex items-center gap-3">
                  <div>
                    <label className="mb-0.5 block font-mono text-[9px] uppercase text-slate-600">Row (0–{cfSize - 1})</label>
                    <input type="number" min={0} max={cfSize - 1} value={cfRow}
                      onChange={(e) => setCfRow(Math.min(cfSize - 1, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-16 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center font-mono text-sm text-slate-200 outline-none" />
                  </div>
                  <div>
                    <label className="mb-0.5 block font-mono text-[9px] uppercase text-slate-600">Col (0–{cfSize - 1})</label>
                    <input type="number" min={0} max={cfSize - 1} value={cfCol}
                      onChange={(e) => setCfCol(Math.min(cfSize - 1, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-16 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center font-mono text-sm text-slate-200 outline-none" />
                  </div>
                  <div className="mt-4 font-mono text-xs text-slate-400">= {notation(cfRow, cfCol, cfSize)}</div>
                </div>
              )}

              {/* Description */}
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500">Notes (optional)</label>
              <textarea value={cfDesc} onChange={(e) => setCfDesc(e.target.value)} rows={2} placeholder="Describe your challenge…"
                className="mb-4 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-400/60 transition-colors" />

              <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-400/80 flex gap-2">
                <Info size={11} className="shrink-0 mt-0.5" />
                Your challenge will be reviewed by the admin before appearing in Community Boards.
              </div>

              <button onClick={submitChallenge}
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-400">
                Submit Challenge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
