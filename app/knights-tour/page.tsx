"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Undo2, Trophy, Lightbulb, X, Timer as TimerIcon,
  ChevronRight, Info, Lock, Trash2, Plus, ShieldCheck, AlertCircle,
  Check, Play, Pause, FastForward, SkipBack, Globe, User,
} from "lucide-react";
import Footer from "@/components/Footer";

// ─── Content filter ───────────────────────────────────────────────────────────
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(fuck|shit|bitch|cunt|dick|pussy|cock|piss|bastard|whore|slut)\b/i,
  /\b(nigger|faggot|retard)\b/i,
  /\b(orospu|piç|yarrak|göt|amk|sik(iş)?|bok|kahpe|oç|ibne|dalyarak)\b/i,
];
function checkName(name: string): { ok: boolean; reason?: string } {
  if (name.trim().length > 32) return { ok: false, reason: "Max 32 characters." };
  if (BLOCKED_PATTERNS.some((r) => r.test(name))) return { ok: false, reason: "Inappropriate content." };
  return { ok: true };
}

// ─── SHA-256 ──────────────────────────────────────────────────────────────────
async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const ADMIN_HASH = (process.env.NEXT_PUBLIC_KT_ADMIN_HASH ?? "").toLowerCase();

// ─── Knight logic ─────────────────────────────────────────────────────────────
const DELTAS: [number, number][] = [
  [-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1],
];

function getMoves(
  r: number, c: number,
  vis: boolean[][], rows: number, cols: number,
  blocked?: boolean[][]
): [number, number][] {
  return DELTAS
    .map(([dr,dc]): [number,number] => [r+dr, c+dc])
    .filter(([nr,nc]) =>
      nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
      !vis[nr]?.[nc] && !(blocked?.[nr]?.[nc])
    );
}

function warnsdorff(
  r: number, c: number,
  vis: boolean[][], rows: number, cols: number,
  blocked?: boolean[][]
): [number,number] | null {
  const moves = getMoves(r, c, vis, rows, cols, blocked);
  if (!moves.length) return null;
  return [...moves].sort((a, b) => {
    const da = getMoves(a[0],a[1],vis,rows,cols,blocked).length;
    const db = getMoves(b[0],b[1],vis,rows,cols,blocked).length;
    if (da !== db) return da - db;
    const sa = getMoves(a[0],a[1],vis,rows,cols,blocked).reduce((s,[nr,nc]) => s + getMoves(nr,nc,vis,rows,cols,blocked).length, 0);
    const sb = getMoves(b[0],b[1],vis,rows,cols,blocked).reduce((s,[nr,nc]) => s + getMoves(nr,nc,vis,rows,cols,blocked).length, 0);
    return sa - sb;
  })[0];
}

// Theme palette. Each theme drives every color surface on the board plus
// the default knight/endpoint glyph. The knight skin can be overridden
// independently via KNIGHT_SKINS, but each theme still ships with a
// "natural" default (e.g. Princess theme defaults to 🤴).
interface Theme {
  id:        string;
  name:      string;
  lightSq:   string;  // lighter chessboard squares
  darkSq:    string;  // darker chessboard squares
  visited:   string;  // overlay for visited squares (rgba)
  visitedFrom: string; // overlay for the starting square
  valid:     string;  // overlay for valid move targets
  validRing: string;  // ring / outline color on valid targets
  validDot:  string;  // center dot color
  hint:      string;  // Warnsdorff hint overlay
  hintRing:  string;  // Warnsdorff hint ring
  knight:    string;  // default knight glyph for this theme
  endpoint:  string;  // icon for the deterministic final square (P&K theme shines here)
  accentText:string;  // number label color
  victory:   "confetti" | "hearts"; // which victory particle variant to spawn on score=3
}

// Knight skins — user-pickable, independent of theme. The "theme" option
// falls back to whatever the current theme declares as its default knight.
interface KnightSkin { id: string; glyph: string; name: string; }
const KNIGHT_SKINS: KnightSkin[] = [
  { id: "theme",    glyph: "",    name: "Temaya göre" },
  { id: "classic",  glyph: "♞",  name: "Klasik" },
  { id: "prince",   glyph: "🤴🏼", name: "Prens" },
  { id: "horse",    glyph: "🐴", name: "At" },
  { id: "unicorn",  glyph: "🦄", name: "Tekboynuz" },
  { id: "stag",     glyph: "🦌", name: "Geyik" },
  { id: "carousel", glyph: "🎠", name: "Atlıkarınca" },
  { id: "jockey",   glyph: "🏇", name: "Binici" },
  { id: "swords",   glyph: "⚔️", name: "Kılıçlar" },
];

// Theme palette design rules (consistent across all themes for predictability):
//   · visited     → chess.com "last move" yellow — readable on both squares
//   · visitedFrom → origin marker, warmer tone (orange/violet)
//   · valid       → very subtle tint + subdued ring/dot (chess.com move-hint style)
//   · hint        → the HERO of each theme, a distinct accent that stands apart
//                   from both `visited` and the board colors so Warnsdorff's
//                   suggestion reads instantly on any square
// Palette bases are drawn from chess.com / lichess canonical hex values.
const THEMES: Theme[] = [
  // lichess canonical "brown" tournament look
  {
    id: "classic", name: "Classic",
    lightSq: "#F0D9B5", darkSq: "#B58863",
    visited:     "rgba(247,247,105,0.42)",
    visitedFrom: "rgba(251,146,60,0.50)",
    valid:       "rgba(0,0,0,0.05)",
    validRing:   "rgba(0,0,0,0.30)",
    validDot:    "rgba(30,41,59,0.55)",
    hint:        "rgba(16,185,129,0.28)",
    hintRing:    "rgba(5,150,105,0.95)",
    knight: "♞", endpoint: "♚", accentText: "rgba(15,23,42,0.85)", victory: "confetti",
  },
  // Dark slate IDE-ish look
  {
    id: "midnight", name: "Midnight",
    lightSq: "#475569", darkSq: "#1E293B",
    visited:     "rgba(251,191,36,0.35)",
    visitedFrom: "rgba(167,139,250,0.48)",
    valid:       "rgba(255,255,255,0.10)",
    validRing:   "rgba(148,163,184,0.55)",
    validDot:    "rgba(226,232,240,0.65)",
    hint:        "rgba(56,189,248,0.32)",
    hintRing:    "rgba(56,189,248,0.95)",
    knight: "♞", endpoint: "♛", accentText: "rgba(226,232,240,0.9)", victory: "confetti",
  },
  // chess.com canonical "green"
  {
    id: "green", name: "Green (chess.com)",
    lightSq: "#EBECD0", darkSq: "#779556",
    visited:     "rgba(247,247,105,0.48)",
    visitedFrom: "rgba(251,146,60,0.50)",
    valid:       "rgba(0,0,0,0.05)",
    validRing:   "rgba(0,0,0,0.30)",
    validDot:    "rgba(30,41,59,0.55)",
    hint:        "rgba(239,68,68,0.28)",
    hintRing:    "rgba(220,38,38,0.95)",
    knight: "♞", endpoint: "♚", accentText: "rgba(15,23,42,0.85)", victory: "confetti",
  },
  // chess.com canonical "blue"
  {
    id: "blue", name: "Blue (chess.com)",
    lightSq: "#DEE3E6", darkSq: "#8CA2AD",
    visited:     "rgba(247,247,105,0.42)",
    visitedFrom: "rgba(251,146,60,0.48)",
    valid:       "rgba(0,0,0,0.05)",
    validRing:   "rgba(0,0,0,0.30)",
    validDot:    "rgba(30,58,138,0.55)",
    hint:        "rgba(234,88,12,0.30)",
    hintRing:    "rgba(234,88,12,0.95)",
    knight: "♞", endpoint: "♛", accentText: "rgba(15,23,42,0.85)", victory: "confetti",
  },
  // Princess & Knight — storybook pastel
  {
    id: "princess", name: "Princess & Knight",
    lightSq: "#F9D9E3", darkSq: "#A54775",
    visited:     "rgba(236,72,153,0.30)",
    visitedFrom: "rgba(167,139,250,0.50)",
    valid:       "rgba(255,255,255,0.12)",
    validRing:   "rgba(190,24,93,0.55)",
    validDot:    "rgba(131,24,67,0.60)",
    hint:        "rgba(250,204,21,0.32)",
    hintRing:    "rgba(234,179,8,0.95)",
    knight: "🤴🏼", endpoint: "👸🏼", accentText: "rgba(67,20,47,0.9)", victory: "hearts",
  },
];

// Princess-theme failure narrative pools. Each failure pairs one fate with
// one encouragement. Keeping them as plain arrays so the pool can grow
// without touching render code. Turkish-first to match the site's language.
const PRINCESS_FATES = [
  "Yaramaz büyücü, Prenses'i renkli bir sabun köpüğünün içine saklayıverdi. Köpük rüzgârla bahçenin üstünden süzülüp gitti.",
  "Büyücü, Prenses'i bir masal kitabının sayfaları arasına koyup kitabı kapattı. Sayfaları tekrar açacak doğru anahtar lazım.",
  "Prenses pembe bir bulutun üstüne oturtuldu. Şimdi gökyüzünde dans eden o bulutu yakalamak gerek.",
  "Büyücü tatlı bir ninni söyledi, Prenses bir çiçeğin içinde rüya görmeye başladı. Uyandırmak için doğru melodi bulunmalı.",
  "Prenses, camdan küçük bir müzik kutusunun içinden gülümseyerek el sallıyor. Kapağı açacak nota dizisi henüz tamamlanmadı.",
  "Şatonun koridorları büyüyle yer değiştirdi; Prenses'e giden yol baştan çizilmeli.",
  "Büyücü, Prenses'i bir gökkuşağının ucuna kondurdu. Gökkuşağı yeniden belirdiğinde o da dönecek.",
];

const KNIGHT_ENCOURAGEMENTS = [
  "Şövalye tatlı tatlı gülümsedi: &quot;Tamam, bu bir provaydı. Asıl yolculuk şimdi başlıyor!&quot;",
  "Atını bir elmayla besledi ve &quot;Hazır olunca tekrar gideriz,&quot; dedi. At başını salladı, rota belli.",
  "Bir kuş şövalyenin omzuna kondu, fısıldadı: &quot;Her adım yeni bir ders. Pes etmek yok!&quot;",
  "Şövalye derin bir nefes aldı, zırhındaki tozu sildi. Denemek, başarının yarısıdır.",
  "Prenses'in küçük notu hâlâ cebinde: &quot;Sana inanıyorum.&quot; Bu bile yeniden yola çıkmaya yeterdi.",
  "&quot;Yeni bir deneme, yeni bir macera!&quot; diye neşeyle haykırdı şövalye. Atı toynaklarıyla onayladı.",
  "Akıllı baykuş konuştu: &quot;Her kahraman ilk seferde ulaşmaz. Önemli olan durmamak.&quot;",
];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Given a starting square and the current visitation map, return the single
// cell that MUST be the final square of a closed tour, if determinism has
// collapsed. Rules:
//   · Candidates = cells knight-reachable from start (ignoring blocked).
//   · Filter candidates to unvisited ones (excluding current pos).
//   · If exactly one remains, that's the locked-in endpoint.
//   · Otherwise return null (either ambiguous or closed tour impossible).
function determinedClosedEndpoint(
  start: [number, number] | null,
  pos: [number, number] | null,
  vis: boolean[][],
  rows: number,
  cols: number,
  blocked: boolean[][],
): [number, number] | null {
  if (!start || !pos) return null;
  const emptyVis: boolean[][] = Array.from({length: rows}, () => Array(cols).fill(false));
  const candidates = getMoves(start[0], start[1], emptyVis, rows, cols, blocked);
  const remaining = candidates.filter(([r, c]) =>
    !vis[r]?.[c] && !(r === pos[0] && c === pos[1])
  );
  return remaining.length === 1 ? remaining[0] : null;
}

function notation(r: number, c: number, rows: number): string {
  return `${String.fromCharCode(97 + c)}${rows - r}`;
}
function fmtTime(s: number): string {
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Snapshot {
  pos: [number,number];
  vis: boolean[][];
  order: [number,number][];
}

interface LBEntry {
  id?: string;
  name: string;
  score: number;
  label: string;
  moves: number;
  secs: number;
  rows: number;
  cols: number;
  date: string;
  path?: [number, number][];
  challengeId?: string;
  challengeTitle?: string;
  hintsUsed?: number;
  undosUsed?: number;
  playerId?: string;
  streak?: number;
}

// Random per-device id, generated once and kept in localStorage. Used to
// distinguish two players who share the same display name across devices.
function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem("kt-player-id");
    if (existing) return existing;
    const fresh =
      (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("kt-player-id", fresh);
    return fresh;
  } catch {
    return "";
  }
}

type ChallengeCategory = "standard" | "advanced" | "expert";
type ChallengeStatus   = "pending"  | "approved" | "rejected";

interface BoardChallenge {
  id: string;
  title: string;
  rows: number;
  cols: number;
  blockedSquares: [number,number][];
  startRow: number | null;
  startCol: number | null;
  description: string;
  submittedAt: string;
  status: ChallengeStatus;
  category: ChallengeCategory;
}

type Phase     = "placing" | "playing" | "done";
type LbTab     = "global" | "mine" | "challenges";
type LbSection = "all" | "standard" | "community";

// ─── Supabase ─────────────────────────────────────────────────────────────────

const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const USE_SB  = !!(SB_URL && SB_KEY);

const sbHead = () => ({
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
});

// ── Leaderboard ───────────────────────────────────────────────────────────────

export class LBError extends Error {
  constructor(public kind: "network" | "http" | "parse", msg: string, public status?: number) {
    super(msg);
  }
}

async function fetchGlobalLB(): Promise<LBEntry[]> {
  if (!USE_SB) {
    console.warn("[KT-LB] Supabase env vars missing — USE_SB=false");
    throw new LBError("network", "Supabase not configured");
  }
  let res: Response;
  try {
    res = await fetch(
      `${SB_URL}/rest/v1/kt_leaderboard?order=score.desc,secs.asc&limit=200&select=id,name,score,label,moves,secs,rows,cols,date,path,challenge_id,challenge_title,hints_used,undos_used,player_id,streak`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
  } catch (err) {
    console.error("[KT-LB] fetch network error:", err);
    throw new LBError("network", String(err));
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[KT-LB] fetch HTTP ${res.status}:`, body);
    throw new LBError("http", body || res.statusText, res.status);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await res.json() as any[]).map((row) => ({
      id:             row.id,
      name:           row.name,
      score:          row.score,
      label:          row.label,
      moves:          row.moves,
      secs:           row.secs,
      rows:           row.rows,
      cols:           row.cols,
      date:           row.date,
      path:           row.path,
      challengeId:    row.challenge_id    ?? undefined,
      challengeTitle: row.challenge_title ?? undefined,
      hintsUsed:      row.hints_used ?? 0,
      undosUsed:      row.undos_used ?? 0,
      playerId:       row.player_id  ?? undefined,
      streak:         row.streak     ?? 1,
    })) as LBEntry[];
  } catch (err) {
    console.error("[KT-LB] fetch parse error:", err);
    throw new LBError("parse", String(err));
  }
}

async function insertGlobalLB(entry: Omit<LBEntry, "id">): Promise<string | null> {
  if (!USE_SB) {
    console.warn("[KT-LB] insert skipped — USE_SB=false");
    return null;
  }
  let res: Response;
  try {
    res = await fetch(`${SB_URL}/rest/v1/kt_leaderboard`, {
      method: "POST",
      headers: { ...sbHead(), Prefer: "return=representation" },
      body: JSON.stringify({
        name:            entry.name,
        score:           entry.score,
        label:           entry.label,
        moves:           entry.moves,
        secs:            entry.secs,
        rows:            entry.rows,
        cols:            entry.cols,
        date:            entry.date,
        path:            entry.path,
        challenge_id:    entry.challengeId    ?? null,
        challenge_title: entry.challengeTitle ?? null,
        hints_used:      entry.hintsUsed ?? 0,
        undos_used:      entry.undosUsed ?? 0,
        player_id:       entry.playerId  ?? null,
        streak:          entry.streak    ?? 1,
      }),
    });
  } catch (err) {
    console.error("[KT-LB] insert network error:", err);
    return null;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[KT-LB] insert HTTP ${res.status}:`, body);
    return null;
  }
  try {
    const data = await res.json() as { id: string }[];
    console.info("[KT-LB] insert OK, id:", data[0]?.id);
    return data[0]?.id ?? null;
  } catch (err) {
    console.error("[KT-LB] insert parse error:", err);
    return null;
  }
}

// Compute the streak value for a new submission. Fetches the player's most
// recent global LB entry and compares paths. Rules:
//   · No prior entry          → streak = 1
//   · Path differs from prior → streak = prior.streak + 1
//   · Path identical (replay) → streak = prior.streak (no change, no reset)
async function computeStreak(
  playerId: string,
  newPath: [number, number][]
): Promise<number> {
  if (!USE_SB || !playerId) return 1;
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kt_leaderboard?player_id=eq.${encodeURIComponent(playerId)}&order=created_at.desc&limit=1&select=streak,path`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    if (!res.ok) return 1;
    const rows = (await res.json()) as { streak: number; path: [number, number][] | null }[];
    if (rows.length === 0) return 1;
    const prior = rows[0];
    const priorStreak = prior.streak ?? 1;
    const priorPath   = prior.path   ?? [];
    const samePath =
      priorPath.length === newPath.length &&
      priorPath.every((p, i) => p[0] === newPath[i][0] && p[1] === newPath[i][1]);
    return samePath ? priorStreak : priorStreak + 1;
  } catch (err) {
    console.error("[KT-LB] computeStreak error:", err);
    return 1;
  }
}

async function deleteGlobalLBEntry(id: string): Promise<void> {
  if (!USE_SB || !id) return;
  try {
    await fetch(`${SB_URL}/rest/v1/kt_leaderboard?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
  } catch { /* */ }
}

// An entry earns the 💎 Diamond badge only when ALL three hold:
// closed tour (score === 3), no hints ever shown, no undos ever used.
function isDiamond(e: LBEntry): boolean {
  return e.score === 3 && (e.hintsUsed ?? 0) === 0 && (e.undosUsed ?? 0) === 0;
}

// Sort comparator: Diamonds first, then score desc, then time asc.
function cmpLB(a: LBEntry, b: LBEntry): number {
  const da = isDiamond(a) ? 1 : 0;
  const db = isDiamond(b) ? 1 : 0;
  if (da !== db) return db - da;
  if (a.score !== b.score) return b.score - a.score;
  return a.secs - b.secs;
}

// ── Challenges ────────────────────────────────────────────────────────────────

// Supabase stores snake_case; we convert on the way in/out
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToChallenge(row: any): BoardChallenge {
  return {
    id:             row.id,
    title:          row.title,
    rows:           row.rows,
    cols:           row.cols,
    blockedSquares: row.blocked_squares ?? [],
    startRow:       row.start_row   ?? null,
    startCol:       row.start_col   ?? null,
    description:    row.description ?? "",
    submittedAt:    row.submitted_at,
    status:         row.status   as ChallengeStatus,
    category:       (row.category ?? "standard") as ChallengeCategory,
  };
}

async function fetchGlobalChallenges(): Promise<BoardChallenge[]> {
  if (!USE_SB) return [];
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/kt_challenges?select=*`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    if (!res.ok) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (await res.json() as any[]).map(rowToChallenge);
  } catch { return []; }
}

async function insertGlobalChallenge(ch: BoardChallenge): Promise<void> {
  if (!USE_SB) return;
  try {
    await fetch(`${SB_URL}/rest/v1/kt_challenges`, {
      method: "POST",
      headers: { ...sbHead(), Prefer: "return=minimal" },
      body: JSON.stringify({
        id:              ch.id,
        title:           ch.title,
        rows:            ch.rows,
        cols:            ch.cols,
        blocked_squares: ch.blockedSquares,
        start_row:       ch.startRow,
        start_col:       ch.startCol,
        description:     ch.description,
        status:          ch.status,
        category:        ch.category,
      }),
    });
  } catch { /* */ }
}

async function updateGlobalChallenge(id: string, status: ChallengeStatus, category?: ChallengeCategory): Promise<void> {
  if (!USE_SB) return;
  try {
    const body: Record<string, string> = { status };
    if (category) body.category = category;
    await fetch(`${SB_URL}/rest/v1/kt_challenges?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...sbHead(), Prefer: "return=minimal" },
      body: JSON.stringify(body),
    });
  } catch { /* */ }
}

async function deleteGlobalChallenge(id: string): Promise<void> {
  if (!USE_SB) return;
  try {
    await fetch(`${SB_URL}/rest/v1/kt_challenges?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
  } catch { /* */ }
}

// ─── Solution Viewer ──────────────────────────────────────────────────────────

function SolutionViewer({ entry, onClose }: { entry: LBEntry; onClose: () => void }) {
  const { rows, cols, path = [], name, label, secs } = entry;
  const totalSteps = path.length;

  const [visibleSteps, setVisibleSteps] = useState(totalSteps);
  const [playing, setPlaying]           = useState(false);
  const [speed, setSpeed]               = useState(220);
  const animRef = useRef<{ step: number; iv: ReturnType<typeof setInterval> | null }>({ step: totalSteps, iv: null });

  useEffect(() => () => { if (animRef.current.iv) clearInterval(animRef.current.iv); }, []);

  const stopPlay = useCallback(() => {
    if (animRef.current.iv) { clearInterval(animRef.current.iv); animRef.current.iv = null; }
    setPlaying(false);
  }, []);

  const startPlay = useCallback((from: number) => {
    if (animRef.current.iv) clearInterval(animRef.current.iv);
    animRef.current.step = from;
    setVisibleSteps(from);
    setPlaying(true);
    animRef.current.iv = setInterval(() => {
      animRef.current.step++;
      if (animRef.current.step > totalSteps) {
        clearInterval(animRef.current.iv!); animRef.current.iv = null;
        setPlaying(false); setVisibleSteps(totalSteps);
      } else {
        setVisibleSteps(animRef.current.step);
      }
    }, speed);
  }, [totalSteps, speed]);

  const CELL   = Math.max(20, Math.min(54, Math.floor(440 / Math.max(rows, cols))));
  const W      = cols * CELL;
  const H      = rows * CELL;
  const STROKE = Math.max(1.5, CELL * 0.07);
  const DOT_R  = Math.max(2.5, CELL * 0.11);
  const FONT_S = Math.max(7, CELL * 0.22);

  const cx = (r: number, c: number) => ({ x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 });
  const visPath = path.slice(0, visibleSteps);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden"
        style={{ maxHeight: "92vh", width: "min(96vw, 560px)" }}
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 shrink-0">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-100 truncate">{name}&apos;s Tour</div>
            <div className="font-mono text-[10px] text-slate-500">
              {label} · {rows}×{cols} · {fmtTime(secs)} · {totalSteps} moves
            </div>
          </div>
          <button onClick={onClose} className="ml-4 shrink-0 text-slate-500 hover:text-slate-200 transition-colors">
            <X size={17}/>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 flex flex-col items-center gap-4">
          <div style={{ position: "relative", width: W, height: H, flexShrink: 0 }}>
            {Array.from({ length: rows * cols }, (_, idx) => {
              const r = Math.floor(idx / cols), c = idx % cols;
              const stepIdx  = visPath.findIndex(([pr, pc]) => pr === r && pc === c);
              const isLight   = (r + c) % 2 === 0;
              const isVisited = stepIdx >= 0;
              const isFirst   = stepIdx === 0;
              const isLast    = stepIdx === visPath.length - 1 && visPath.length > 1;
              return (
                <div key={idx} style={{
                  position: "absolute",
                  left: c * CELL, top: r * CELL,
                  width: CELL, height: CELL,
                  backgroundColor: isLight ? "#CBD5E1" : "#64748B",
                  boxSizing: "border-box",
                  border: "0.5px solid rgba(0,0,0,0.1)",
                }}>
                  {isVisited && (
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundColor: isFirst ? "rgba(139,92,246,0.4)" : isLast ? "rgba(52,211,153,0.4)" : "rgba(56,189,248,0.22)",
                    }}/>
                  )}
                  {isVisited && (
                    <span style={{
                      position: "absolute", left: 2, top: 1,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: FONT_S, lineHeight: 1,
                      color: "rgba(15,23,42,0.85)", fontWeight: 600, zIndex: 1,
                    }}>{stepIdx + 1}</span>
                  )}
                </div>
              );
            })}

            <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }} width={W} height={H}>
              {visPath.slice(1).map((_, i) => {
                const from = cx(visPath[i][0], visPath[i][1]);
                const to   = cx(visPath[i+1][0], visPath[i+1][1]);
                return (
                  <motion.path
                    key={`ln-${i}-${from.x}-${from.y}`}
                    d={`M ${from.x},${from.y} L ${to.x},${to.y}`}
                    stroke={playing && i === visPath.length - 2 ? "#FBBF24" : "#38BDF8"}
                    strokeWidth={STROKE} strokeLinecap="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                );
              })}
              {visPath.map(([r, c], i) => {
                const pt   = cx(r, c);
                const fill = i === 0 ? "#A78BFA" : i === visPath.length - 1 ? "#34D399" : "#38BDF8";
                return (
                  <motion.circle key={`dot-${i}`} cx={pt.x} cy={pt.y} r={DOT_R} fill={fill}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.12 }}/>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-violet-400"/>Start</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-sky-400"/>Move</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400"/>End</span>
            <span className="ml-2 text-slate-600">{visibleSteps}/{totalSteps}</span>
          </div>
        </div>

        <div className="border-t border-slate-800 px-5 py-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => playing ? stopPlay() : startPlay(visibleSteps >= totalSteps ? 1 : visibleSteps || 1)}
              className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2 text-xs font-medium text-white transition-colors">
              {playing ? <Pause size={12}/> : <Play size={12}/>}
              {playing ? "Pause" : visibleSteps >= totalSteps ? "Replay" : "Play"}
            </button>
            <button onClick={() => { stopPlay(); animRef.current.step = totalSteps; setVisibleSteps(totalSteps); }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
              <FastForward size={12}/>All
            </button>
            <button onClick={() => { stopPlay(); animRef.current.step = 0; setVisibleSteps(0); }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
              <SkipBack size={12}/>Reset
            </button>
            <div className="ml-auto flex items-center gap-1 font-mono text-[10px]">
              <span className="text-slate-600 mr-0.5">Speed:</span>
              {([["Slow", 500], ["Normal", 220], ["Fast", 80]] as [string, number][]).map(([lbl, ms]) => (
                <button key={lbl} onClick={() => setSpeed(ms)}
                  className={`rounded-lg px-2 py-1 transition-colors ${speed === ms ? "bg-sky-400/20 text-sky-400" : "text-slate-500 hover:text-slate-300"}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Player Modal ─────────────────────────────────────────────────────────────

function PlayerModal({
  playerName, entries, onClose, onViewSolution,
}: {
  playerName: string;
  entries: LBEntry[];
  onClose: () => void;
  onViewSolution: (e: LBEntry) => void;
}) {
  type Group = { label: string; boardLabel: string; isChallenge: boolean; entries: LBEntry[] };
  const groupMap = new Map<string, Group>();
  for (const e of entries) {
    const key = e.challengeId ?? `${e.rows}×${e.cols}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        label:       e.challengeTitle ?? `${e.rows}×${e.cols}`,
        boardLabel:  `${e.rows}×${e.cols}`,
        isChallenge: !!e.challengeId,
        entries:     [],
      });
    }
    groupMap.get(key)!.entries.push(e);
  }
  const groups = Array.from(groupMap.values());
  const totalSolutions = entries.length;
  const closedCount    = entries.filter(e => e.score === 3).length;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden"
        style={{ maxHeight: "88vh", width: "min(96vw, 480px)" }}
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-semibold truncate">{playerName}</span>
              {closedCount > 0 && (
                <span className="shrink-0 rounded-md bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400">
                  {closedCount}× closed
                </span>
              )}
            </div>
            <div className="font-mono text-[10px] text-slate-500 mt-0.5">
              {totalSolutions} tour{totalSolutions !== 1 ? "s" : ""} completed · {groups.length} board{groups.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button onClick={onClose} className="ml-4 shrink-0 text-slate-500 hover:text-slate-200 transition-colors">
            <X size={17}/>
          </button>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {groups.map((group, gi) => (
            <div key={gi}>
              {/* Group header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-slate-500">
                  {group.isChallenge ? "⚡" : "♟"} {group.label}
                </span>
                <span className="font-mono text-[9px] text-slate-700">{group.boardLabel}</span>
                {group.entries.length > 1 && (
                  <span className="flex items-center gap-0.5 rounded-md bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] text-amber-400">
                    🔥 {group.entries.length}× solved
                  </span>
                )}
                <div className="flex-1 h-px bg-slate-800"/>
              </div>

              {/* Entries */}
              <div className="space-y-1.5">
                {group.entries
                  .sort(cmpLB)
                  .map((e, i) => (
                    <div key={i}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className={`font-mono text-xs font-semibold ${e.score===3?"text-emerald-400":"text-sky-400"}`}>
                          {e.score===3?"Closed Tour":"Open Tour"}
                        </div>
                        <div className="font-mono text-[10px] text-slate-600 mt-0.5">
                          {fmtTime(e.secs)} · {e.moves} moves · {e.date}
                        </div>
                      </div>
                      {e.path?.length ? (
                        <button
                          onClick={() => onViewSolution(e)}
                          className="flex items-center gap-1 rounded-lg bg-sky-500/10 border border-sky-500/20 px-2.5 py-1.5 text-[10px] font-mono text-sky-400 hover:bg-sky-500/20 transition-colors shrink-0">
                          <Play size={10}/>Replay
                        </button>
                      ) : (
                        <span className="font-mono text-[10px] text-slate-700 shrink-0">no path</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Challenge Preview Modal ──────────────────────────────────────────────────

function ChallengePreviewModal({ challenge, onClose }: { challenge: BoardChallenge; onClose: () => void }) {
  const { rows, cols, blockedSquares, startRow, startCol, title, description, category } = challenge;
  const CELL = Math.max(22, Math.min(52, Math.floor(400 / Math.max(rows, cols))));
  const W = cols * CELL, H = rows * CELL;

  return (
    <motion.div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        className="flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh", width: "min(96vw, 520px)" }}
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100 truncate">{title}</span>
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] ${
                category==="expert"   ? "bg-rose-400/10 text-rose-400"
                : category==="advanced" ? "bg-amber-400/10 text-amber-400"
                : "bg-emerald-400/10 text-emerald-400"
              }`}>{category}</span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 mt-0.5">
              {rows}×{cols} · {rows * cols - blockedSquares.length} active squares
              {startRow !== null ? ` · Fixed start` : " · Free start"}
            </div>
          </div>
          <button onClick={onClose} className="ml-4 shrink-0 text-slate-500 hover:text-slate-200 transition-colors">
            <X size={17}/>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 flex flex-col items-center gap-4">
          <div className="overflow-auto">
            <div style={{ position: "relative", width: W, height: H, flexShrink: 0 }}>
              {Array.from({ length: rows * cols }, (_, idx) => {
                const r = Math.floor(idx / cols), c = idx % cols;
                const isBlocked = blockedSquares.some(([br, bc]) => br === r && bc === c);
                const isStart   = startRow === r && startCol === c;
                const isLight   = (r + c) % 2 === 0;
                return (
                  <div key={idx} style={{
                    position: "absolute", left: c * CELL, top: r * CELL,
                    width: CELL, height: CELL, boxSizing: "border-box",
                    border: "0.5px solid rgba(0,0,0,0.12)",
                    backgroundColor: isBlocked ? "#0F172A" : isLight ? "#CBD5E1" : "#64748B",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isBlocked && (
                      <span style={{ fontFamily: "monospace", fontSize: Math.max(8, CELL * 0.3), color: "#334155" }}>✕</span>
                    )}
                    {isStart && !isBlocked && (
                      <span style={{ fontSize: Math.max(10, CELL * 0.5), lineHeight: 1 }}>♞</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {description && (
            <p className="text-sm text-slate-400 text-center max-w-xs">{description}</p>
          )}

          <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-slate-950 border border-slate-800"/>Removed
            </span>
            {startRow !== null && (
              <span className="flex items-center gap-1">♞ Fixed start at {notation(startRow, startCol!, rows)}</span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KnightsTourPage() {

  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);

  const [vis, setVis]         = useState<boolean[][]>([]);
  const [blocked, setBlocked] = useState<boolean[][]>([]);
  const [order, setOrder]     = useState<[number,number][]>([]);
  const [pos, setPos]         = useState<[number,number] | null>(null);
  const [start, setStart]     = useState<[number,number] | null>(null);
  const [phase, setPhase]     = useState<Phase>("placing");
  const [hist, setHist]       = useState<Snapshot[]>([]);
  const [hintCell, setHintCell]   = useState<[number,number] | null>(null);
  const [showHint, setShowHint]   = useState(false);
  // Per-run purity flags: once true in a run, they stay true until the run
  // ends and saveEntry is called. Used to decide the 💎 Diamond badge.
  const [hintUsedRun, setHintUsedRun] = useState(false);
  const [undoUsedRun, setUndoUsedRun] = useState(false);
  const [themeId, setThemeId]       = useState<string>("classic");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
  const [knightSkinId, setKnightSkinId] = useState<string>("theme");
  const [showKnightPicker, setShowKnightPicker] = useState(false);
  // "theme" means: whatever glyph the active theme ships. Any other id picks
  // a specific skin, overriding the theme default.
  const knightGlyph = (() => {
    if (knightSkinId === "theme") return theme.knight;
    const s = KNIGHT_SKINS.find((k) => k.id === knightSkinId);
    return s?.glyph || theme.knight;
  })();
  const [showStoryIntro, setShowStoryIntro] = useState(false);
  const [soundMuted, setSoundMuted]         = useState(false);
  // Only true right after a closed tour; drives victory overlay + fanfare.
  const [victoryActive, setVictoryActive]   = useState(false);
  // Princess-theme failure: random fate + encouragement pair, regenerated
  // at each failure so every try tells a different story.
  const [failureStory, setFailureStory] = useState<{ fate: string; hope: string } | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const tick      = useRef<ReturnType<typeof setInterval> | null>(null);
  const [secs, setSecs]           = useState(0);
  const [score, setScore]         = useState(0);
  const [scoreLabel, setScoreLabel]   = useState("");
  const [resultMsg, setResultMsg]     = useState("");

  const autoPlace      = useRef<{row:number; col:number} | null>(null);
  const pendingBlocked = useRef<[number,number][]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // ── Admin ───────────────────────────────────────────────────────────────────
  const [adminMode, setAdminMode]           = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPw, setAdminPw]               = useState("");
  const [adminPwErr, setAdminPwErr]         = useState("");

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  // globalLb  → Supabase, full tours only (score >= 2), visible to everyone
  // localLb   → localStorage, all of this user's scores including partials
  const [globalLb, setGlobalLb]         = useState<LBEntry[]>([]);
  const [localLb, setLocalLb]           = useState<LBEntry[]>([]);
  const [lbLoading, setLbLoading]       = useState(false);
  const [lbError, setLbError]           = useState<string | null>(null);
  const [showLb, setShowLb]             = useState(false);
  const [lbTab, setLbTab]               = useState<LbTab>("global");
  const [nameInput, setNameInput]       = useState("");
  const [nameErr, setNameErr]           = useState("");
  const [showNameDlg, setShowNameDlg]   = useState(false);
  const [solutionEntry, setSolutionEntry]       = useState<LBEntry | null>(null);
  const [previewChallenge, setPreviewChallenge] = useState<BoardChallenge | null>(null);
  const [playerEntries, setPlayerEntries]       = useState<{ name: string; entries: LBEntry[] } | null>(null);
  const [lbBoardFilter, setLbBoardFilter]       = useState<string>("all");
  const [lbSection, setLbSection]               = useState<LbSection>("all");

  // ── Challenges ───────────────────────────────────────────────────────────────
  const [challenges, setChallenges] = useState<BoardChallenge[]>([]);
  const [showSandbox, setShowSandbox] = useState(false);
  const [cfTitle, setCfTitle]   = useState("");
  const [cfRows, setCfRows]     = useState(6);
  const [cfCols, setCfCols]     = useState(6);
  // Parallel string buffers so mobile users can fully clear the numeric
  // inputs (type="number" + strict clamping previously blocked empty values).
  const [cfRowsStr, setCfRowsStr] = useState("6");
  const [cfColsStr, setCfColsStr] = useState("6");
  const [cfRowStr,  setCfRowStr]  = useState("0");
  const [cfColStr,  setCfColStr]  = useState("0");
  const [cfDesc, setCfDesc]     = useState("");
  const [cfFixed, setCfFixed]   = useState(false);
  const [cfRow, setCfRow]       = useState(0);
  const [cfCol, setCfCol]       = useState(0);
  const [cfBlocked, setCfBlocked] = useState<[number,number][]>([]);

  const communityBoards = challenges.filter((c) => c.status === "approved");
  const pendingCount    = challenges.filter((c) => c.status === "pending").length;
  // Community tab filter: "all" shows every approved board, others filter by
  // difficulty category. Default "all" so first-time visitors see everything.
  const [communityFilter, setCommunityFilter] = useState<"all"|"beginner"|"advanced"|"expert">("all");
  const filteredCommunityBoards = communityFilter === "all"
    ? communityBoards
    : communityBoards.filter((b) => b.category === communityFilter);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = useCallback((r: number, c: number, blockedSquares: [number,number][] = []) => {
    if (tick.current)      clearInterval(tick.current);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setVis(Array.from({length:r}, () => Array(c).fill(false)));
    const bl: boolean[][] = Array.from({length:r}, () => Array(c).fill(false));
    for (const [br, bc] of blockedSquares) { if (br < r && bc < c) bl[br][bc] = true; }
    setBlocked(bl);
    setOrder([]); setPos(null); setStart(null);
    setPhase("placing"); setHist([]);
    setHintCell(null); setShowHint(false);
    setHintUsedRun(false); setUndoUsedRun(false);
    setSecs(0); setScore(0); setScoreLabel(""); setResultMsg("");
    setNameInput(""); setNameErr("");
    setSelectedBoardId(null);
  }, []);

  useEffect(() => {
    const bl = pendingBlocked.current;
    pendingBlocked.current = [];
    reset(rows, cols, bl);
  }, [rows, cols, reset]);

  useEffect(() => {
    if (phase === "placing" && autoPlace.current && vis.length === rows && vis[0]?.length === cols) {
      const {row, col} = autoPlace.current;
      autoPlace.current = null;
      const v: boolean[][] = Array.from({length:rows}, () => Array(cols).fill(false));
      v[row][col] = true;
      const p: [number,number] = [row, col];
      setVis(v); setOrder([p]); setPos(p); setStart(p);
      setPhase("playing");
      setHintCell(warnsdorff(row, col, v, rows, cols, blocked));
    }
  }, [phase, vis, rows, cols, blocked]);

  useEffect(() => {
    if (phase === "playing") {
      tick.current = setInterval(() => setSecs((s) => s + 1), 1000);
    } else {
      if (tick.current) clearInterval(tick.current);
    }
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [phase]);

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Local LB (all scores including partials) — always from localStorage
    try { const r = localStorage.getItem("kt-lb-local"); if (r) setLocalLb(JSON.parse(r)); } catch { /* */ }

    // Theme + skin + sound preferences
    try {
      const t = localStorage.getItem("kt-theme");
      if (t && THEMES.some((x) => x.id === t)) {
        setThemeId(t);
      } else if (!localStorage.getItem("kt-first-visit-done")) {
        // First-ever visit: default to Princess & Knight + auto-show the
        // castle intro story. Mark the flag so we never force this again.
        setThemeId("princess");
        setShowStoryIntro(true);
        try {
          localStorage.setItem("kt-theme", "princess");
          localStorage.setItem("kt-first-visit-done", "1");
          localStorage.setItem("kt-princess-intro-seen", "1");
        } catch { /* */ }
      }
      const k = localStorage.getItem("kt-knight");
      if (k && KNIGHT_SKINS.some((x) => x.id === k)) setKnightSkinId(k);
      if (localStorage.getItem("kt-muted") === "1") setSoundMuted(true);
    } catch { /* */ }

    // Global LB (full tours) — Supabase if configured
    if (USE_SB) {
      setLbLoading(true);
      setLbError(null);
      fetchGlobalLB()
        .then((data) => { setGlobalLb(data); setLbLoading(false); })
        .catch((err: LBError) => {
          setLbLoading(false);
          setLbError(
            err.kind === "http"
              ? `Supabase HTTP ${err.status}: ${err.message.slice(0, 140)}`
              : err.kind === "network"
                ? `Ağ hatası: ${err.message.slice(0, 140)}`
                : `Veri çözümleme hatası: ${err.message.slice(0, 140)}`
          );
        });
    } else {
      setLbError("Supabase ortam değişkenleri yüklenemedi (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).");
    }

    // Challenges — Supabase if configured, else localStorage
    if (USE_SB) {
      fetchGlobalChallenges().then((data) => {
        if (data.length > 0) setChallenges(data);
        else { try { const r = localStorage.getItem("kt-sandbox-v1"); if (r) setChallenges(JSON.parse(r)); } catch { /* */ } }
      });
    } else {
      try { const r = localStorage.getItem("kt-sandbox-v1"); if (r) setChallenges(JSON.parse(r)); } catch { /* */ }
    }
  }, []);

  useEffect(() => { setCfBlocked([]); }, [cfRows, cfCols]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const validMoves: [number,number][] =
    pos && phase === "playing" ? getMoves(pos[0], pos[1], vis, rows, cols, blocked) : [];
  const blockedCount = blocked.reduce((acc, row) => acc + row.filter(Boolean).length, 0);
  const total        = rows * cols - blockedCount;
  const progress     = total > 0 ? order.length / total : 0;
  const isFullTour   = (sc: number) => sc >= 2;
  const lockedEndpoint = phase === "playing"
    ? determinedClosedEndpoint(start, pos, vis, rows, cols, blocked)
    : null;

  // ── Cell click ──────────────────────────────────────────────────────────────
  const handleClick = useCallback((r: number, c: number) => {
    if (blocked[r]?.[c]) return;
    if (phase === "placing") {
      const v: boolean[][] = Array.from({length:rows}, () => Array(cols).fill(false));
      v[r][c] = true;
      const p: [number,number] = [r,c];
      setVis(v); setOrder([p]); setPos(p); setStart(p);
      setPhase("playing");
      setHintCell(warnsdorff(r, c, v, rows, cols, blocked));
      return;
    }
    if (phase !== "playing" || !pos) return;
    if (!validMoves.some(([vr,vc]) => vr===r && vc===c)) return;

    setHist((h) => [...h, {pos, vis: vis.map((row) => [...row]), order: [...order]}]);
    const nv = vis.map((row) => [...row]);
    nv[r][c] = true;
    const np: [number,number]       = [r,c];
    const nOrder: [number,number][] = [...order, np];
    const nextMoves                  = getMoves(r, c, nv, rows, cols, blocked);

    setVis(nv); setOrder(nOrder); setPos(np);
    setHintCell(warnsdorff(r, c, nv, rows, cols, blocked));
    setShowHint(false);

    if (nOrder.length === total) {
      if (tick.current) clearInterval(tick.current);
      const closed = start ? DELTAS.some(([dr,dc]) => r+dr === start[0] && c+dc === start[1]) : false;
      const sc  = closed ? 3 : 2;
      setScore(sc); setScoreLabel(closed ? "Closed Tour" : "Open Tour");
      setResultMsg(closed ? "Perfect! The knight returned to its starting square." : "Excellent! Every square visited — an open tour.");
      setPhase("done");
      // Celebrate closed tours with confetti + fanfare, then show the name
      // dialog after a short delay so the particles have breathing room.
      if (closed) {
        setVictoryActive(true);
        if (!soundMuted) playFanfare(theme.victory);
        setTimeout(() => setShowNameDlg(true), 900);
      } else {
        setShowNameDlg(true);
      }
    } else if (nextMoves.length === 0) {
      if (tick.current) clearInterval(tick.current);
      const visited = nOrder.length;
      setScore(parseFloat((visited / total).toFixed(4)));
      setScoreLabel(`${visited} / ${total}`);
      setResultMsg(`No more moves — ${visited} of ${total} squares visited.`);
      setPhase("done");
      // Princess theme gets a gentle, storybook failure interstitial before
      // the score-save dialog appears. Non-Princess themes skip straight to
      // save, preserving the existing flow.
      if (themeId === "princess") {
        setFailureStory({
          fate: pickRandom(PRINCESS_FATES),
          hope: pickRandom(KNIGHT_ENCOURAGEMENTS),
        });
      } else {
        setShowNameDlg(true);
      }
    }
  }, [phase, rows, cols, pos, vis, order, validMoves, start, total, blocked]);

  // ── Undo ────────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!hist.length || phase !== "playing") return;
    const snap = hist[hist.length - 1];
    setHist((h) => h.slice(0, -1));
    setVis(snap.vis); setOrder(snap.order); setPos(snap.pos);
    setHintCell(warnsdorff(snap.pos[0], snap.pos[1], snap.vis, rows, cols, blocked));
    setShowHint(false);
    setUndoUsedRun(true);
  }, [hist, phase, rows, cols, blocked]);

  const onHint = () => {
    setShowHint(true);
    setHintUsedRun(true);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setShowHint(false), 3500);
  };

  // ── Admin ───────────────────────────────────────────────────────────────────
  const tryLogin = async () => {
    if (!ADMIN_HASH) { setAdminPwErr("NEXT_PUBLIC_KT_ADMIN_HASH not set."); return; }
    const hash = await sha256(adminPw);
    if (hash === ADMIN_HASH) {
      setAdminMode(true); setShowAdminLogin(false); setAdminPw(""); setAdminPwErr("");
      setLbTab("challenges");
    } else {
      setAdminPwErr("Incorrect password.");
    }
  };

  // ── Save entry ───────────────────────────────────────────────────────────────
  const saveEntry = async (name: string) => {
    const chk = checkName(name);
    if (!chk.ok) { setNameErr(chk.reason!); return; }

    const activeChallenge = selectedBoardId
      ? challenges.find((c) => c.id === selectedBoardId)
      : null;

    const playerId    = getOrCreatePlayerId();
    const path        = [...order] as [number, number][];
    const hintsUsed   = hintUsedRun ? 1 : 0;
    const undosUsed   = undoUsedRun ? 1 : 0;

    // Only compute streak for qualifying submissions (full tours go to global).
    // For purely local entries we still track a local streak value of 1.
    const streak = isFullTour(score) && USE_SB
      ? await computeStreak(playerId, path)
      : 1;

    const entry: Omit<LBEntry, "id"> = {
      name: name.trim() || "Anonymous",
      score, label: scoreLabel,
      moves: order.length, secs,
      rows, cols,
      date: new Date().toLocaleDateString(),
      path,
      challengeId:    activeChallenge?.id    ?? undefined,
      challengeTitle: activeChallenge?.title ?? undefined,
      hintsUsed,
      undosUsed,
      playerId,
      streak,
    };

    // Always save to local (all scores)
    const nextLocal = [...localLb, entry].sort(cmpLB).slice(0, 100);
    setLocalLb(nextLocal);
    try { localStorage.setItem("kt-lb-local", JSON.stringify(nextLocal)); } catch { /* */ }

    // Full tours (score >= 2) → Supabase global
    if (isFullTour(score) && USE_SB) {
      insertGlobalLB(entry).then((id) => {
        const withId: LBEntry = { ...entry, id: id ?? undefined };
        setGlobalLb((prev) => [...prev, withId].sort(cmpLB).slice(0, 50));
      });
    }

    setShowNameDlg(false);
    setShowLb(true);
    // Land on the tab that has the new entry
    setLbTab(isFullTour(score) ? "global" : "mine");
  };

  // ── Delete LB entry ──────────────────────────────────────────────────────────
  const deleteGlobal = async (entry: LBEntry, idx: number) => {
    if (entry.id) await deleteGlobalLBEntry(entry.id);
    setGlobalLb((prev) => prev.filter((_, j) => j !== idx));
  };
  const deleteLocal = (idx: number) => {
    const next = localLb.filter((_, j) => j !== idx);
    setLocalLb(next);
    try { localStorage.setItem("kt-lb-local", JSON.stringify(next)); } catch { /* */ }
  };

  // ── Challenges ops ───────────────────────────────────────────────────────────
  const saveChallengesLocal = (next: BoardChallenge[]) => {
    setChallenges(next);
    if (!USE_SB) try { localStorage.setItem("kt-sandbox-v1", JSON.stringify(next)); } catch { /* */ }
  };

  const toggleCfBlock = (r: number, c: number) => {
    if (cfFixed && r === cfRow && c === cfCol) return;
    const exists = cfBlocked.some(([br,bc]) => br===r && bc===c);
    if (exists) setCfBlocked(cfBlocked.filter(([br,bc]) => !(br===r && bc===c)));
    else        setCfBlocked([...cfBlocked, [r, c] as [number,number]]);
  };

  const submitChallenge = async () => {
    const ch: BoardChallenge = {
      id:             Math.random().toString(36).slice(2),
      title:          cfTitle.trim() || `${cfRows}×${cfCols} Challenge`,
      rows:           cfRows, cols: cfCols,
      blockedSquares: cfBlocked,
      startRow:       cfFixed ? cfRow : null,
      startCol:       cfFixed ? cfCol : null,
      description:    cfDesc.trim(),
      submittedAt:    new Date().toISOString(),
      status:         "pending",
      category:       "standard",
    };
    saveChallengesLocal([...challenges, ch]);
    if (USE_SB) await insertGlobalChallenge(ch);
    setShowSandbox(false);
    setCfTitle(""); setCfDesc(""); setCfFixed(false); setCfBlocked([]);
  };

  const reviewChallenge = async (id: string, status: ChallengeStatus, cat?: ChallengeCategory) => {
    saveChallengesLocal(challenges.map((c) => c.id === id ? {...c, status, category: cat ?? c.category} : c));
    if (USE_SB) await updateGlobalChallenge(id, status, cat);
  };

  const removeChallenge = async (id: string) => {
    saveChallengesLocal(challenges.filter((c) => c.id !== id));
    if (USE_SB) await deleteGlobalChallenge(id);
  };

  const playCommunityBoard = (board: BoardChallenge) => {
    setSelectedBoardId(board.id);
    if (board.startRow !== null && board.startCol !== null)
      autoPlace.current = {row: board.startRow, col: board.startCol};
    pendingBlocked.current = board.blockedSquares ?? [];
    if (rows === board.rows && cols === board.cols) {
      const bl = pendingBlocked.current; pendingBlocked.current = [];
      reset(board.rows, board.cols, bl);
    } else {
      setRows(board.rows); setCols(board.cols);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-400 mb-2">
            <span>Game</span><ChevronRight size={11}/><span className="text-sky-400">Knight&apos;s Tour</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Knight&apos;s Tour</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Move a chess knight to every square exactly once using{" "}
            <span className="font-mono text-sky-400">L-shaped</span> jumps.
            Hints use <span className="font-mono text-amber-400">Warnsdorff&apos;s heuristic</span>.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Board ──────────────────────────────────────────────────────── */}
          <div className="w-full lg:flex-1 min-w-0">

            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Standard</span>
                {([6,8] as const).map((n) => (
                  <button key={n}
                    onClick={() => { setRows(n); setCols(n); setSelectedBoardId(null); }}
                    className={`rounded-lg px-3 py-1 font-mono text-xs transition-all ${
                      rows===n && cols===n && !selectedBoardId
                        ? "bg-sky-400/20 text-sky-400 border border-sky-400/40"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}>{n}×{n}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {/* Theme picker */}
                <div className="relative">
                  <button
                    onClick={() => { setShowThemePicker((v) => !v); setShowKnightPicker(false); }}
                    title="Tahta teması"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300/60 dark:border-slate-700/60 px-2.5 py-1 font-mono text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-200 hover:border-sky-400/60 transition-colors">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{background:`linear-gradient(135deg, ${theme.lightSq} 50%, ${theme.darkSq} 50%)`}}/>
                    {theme.name}
                  </button>
                  <AnimatePresence>
                    {showThemePicker && (
                      <motion.div
                        initial={{opacity:0, y:-4, scale:0.96}}
                        animate={{opacity:1, y:0, scale:1}}
                        exit={{opacity:0, y:-4, scale:0.96}}
                        transition={{duration:0.15}}
                        className="absolute right-0 top-full mt-1 z-30 min-w-[220px] rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur p-1.5 shadow-2xl">
                        {THEMES.map((t) => (
                          <button key={t.id}
                            onClick={() => {
                              const isNewPrincess = t.id === "princess" && themeId !== "princess";
                              setThemeId(t.id);
                              setShowThemePicker(false);
                              try { localStorage.setItem("kt-theme", t.id); } catch { /* */ }
                              // First-ever Princess switch shows the intro story.
                              if (isNewPrincess) {
                                let seen = false;
                                try { seen = localStorage.getItem("kt-princess-intro-seen") === "1"; } catch { /* */ }
                                if (!seen) setShowStoryIntro(true);
                              }
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                              t.id === theme.id
                                ? "bg-sky-400/15 text-sky-400"
                                : "text-slate-300 hover:bg-slate-800"
                            }`}>
                            <span className="inline-block w-4 h-4 rounded shrink-0" style={{background:`linear-gradient(135deg, ${t.lightSq} 50%, ${t.darkSq} 50%)`}}/>
                            <span className="flex-1 truncate">{t.name}</span>
                            <span className="font-mono opacity-60">{t.knight}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Knight skin picker */}
                <div className="relative">
                  <button
                    onClick={() => { setShowKnightPicker((v) => !v); setShowThemePicker(false); }}
                    title="Taş seç"
                    className="flex items-center gap-1 rounded-lg border border-slate-300/60 dark:border-slate-700/60 px-2 py-1 font-mono text-[13px] text-slate-500 dark:text-slate-400 hover:text-slate-200 hover:border-sky-400/60 transition-colors">
                    <span className="leading-none">{knightGlyph}</span>
                  </button>
                  <AnimatePresence>
                    {showKnightPicker && (
                      <motion.div
                        initial={{opacity:0, y:-4, scale:0.96}}
                        animate={{opacity:1, y:0, scale:1}}
                        exit={{opacity:0, y:-4, scale:0.96}}
                        transition={{duration:0.15}}
                        className="absolute right-0 top-full mt-1 z-30 min-w-[170px] rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur p-1.5 shadow-2xl">
                        {KNIGHT_SKINS.map((k) => (
                          <button key={k.id}
                            onClick={() => {
                              setKnightSkinId(k.id);
                              setShowKnightPicker(false);
                              try { localStorage.setItem("kt-knight", k.id); } catch { /* */ }
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                              k.id === knightSkinId
                                ? "bg-sky-400/15 text-sky-400"
                                : "text-slate-300 hover:bg-slate-800"
                            }`}>
                            <span className="w-5 text-center font-mono leading-none text-base">
                              {k.id === "theme" ? theme.knight : k.glyph}
                            </span>
                            <span className="flex-1 truncate">{k.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Story replay (only when Princess theme is active) */}
                {themeId === "princess" && (
                  <button
                    onClick={() => setShowStoryIntro(true)}
                    title="Hikâyeyi tekrar oku"
                    className="rounded-lg border border-slate-300/60 dark:border-slate-700/60 px-2 py-1 text-[13px] hover:border-pink-400/60 hover:text-pink-400 text-slate-500 dark:text-slate-400 transition-colors">
                    📖
                  </button>
                )}

                {/* Mute toggle */}
                <button
                  onClick={() => {
                    const next = !soundMuted;
                    setSoundMuted(next);
                    try { localStorage.setItem("kt-muted", next ? "1" : "0"); } catch { /* */ }
                  }}
                  title={soundMuted ? "Ses kapalı" : "Ses açık"}
                  className="rounded-lg border border-slate-300/60 dark:border-slate-700/60 px-2 py-1 text-[13px] text-slate-500 dark:text-slate-400 hover:text-sky-400 hover:border-sky-400/60 transition-colors">
                  {soundMuted ? "🔇" : "🔊"}
                </button>

                <div className="flex items-center gap-1.5 font-mono text-sm text-slate-400 ml-1">
                  <TimerIcon size={13}/><span>{fmtTime(secs)}</span>
                </div>
              </div>
            </div>

            {communityBoards.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Community</span>
                  {/* Category filter tabs — "Tümü" is the default, others
                      narrow down to a single difficulty bucket. */}
                  {([
                    { id: "all",      label: "Tümü",     color: "sky" },
                    { id: "beginner", label: "Beginner", color: "emerald" },
                    { id: "advanced", label: "Advanced", color: "amber" },
                    { id: "expert",   label: "Expert",   color: "rose" },
                  ] as const).map((f) => {
                    const active = communityFilter === f.id;
                    const count  = f.id === "all"
                      ? communityBoards.length
                      : communityBoards.filter((b) => b.category === f.id).length;
                    return (
                      <button key={f.id} onClick={() => setCommunityFilter(f.id)}
                        className={`rounded-lg px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest transition-all ${
                          active
                            ? f.color === "sky"     ? "bg-sky-400/20 text-sky-400 border border-sky-400/40"
                            : f.color === "emerald" ? "bg-emerald-400/20 text-emerald-400 border border-emerald-400/40"
                            : f.color === "amber"   ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                            :                         "bg-rose-400/20 text-rose-400 border border-rose-400/40"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-200 border border-transparent"
                        }`}>
                        {f.label}<span className="opacity-60 ml-1">{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {filteredCommunityBoards.length === 0 && (
                    <span className="font-mono text-xs text-slate-500 italic">
                      Bu kategoride henüz tahta yok.
                    </span>
                  )}
                  {filteredCommunityBoards.map((board) => {
                    const solvers = globalLb.filter((e) => e.challengeId === board.id).length;
                    return (
                      <button key={board.id} onClick={() => playCommunityBoard(board)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                          selectedBoardId === board.id
                            ? board.category==="expert"  ? "border-rose-400   bg-rose-400/15  text-rose-400"
                            : board.category==="advanced"? "border-amber-400  bg-amber-400/15 text-amber-400"
                            :                              "border-emerald-400 bg-emerald-400/15 text-emerald-400"
                            : board.category==="expert"  ? "border-rose-400/30   bg-rose-400/5   text-rose-400/80   hover:bg-rose-400/10"
                            : board.category==="advanced"? "border-amber-400/30  bg-amber-400/5  text-amber-400/80  hover:bg-amber-400/10"
                            :                              "border-emerald-400/30 bg-emerald-400/5 text-emerald-400/80 hover:bg-emerald-400/10"
                        }`}>
                        {board.category==="expert"?"⭐":board.category==="advanced"?"⚡":"✓"}
                        <span className="font-medium">{board.title}</span>
                        <span className="opacity-60 font-mono">{board.rows}×{board.cols}</span>
                        {solvers > 0 && (
                          <span className="opacity-60 font-mono text-[9px]">🏆{solvers}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-2 h-5 text-sm">
              {phase==="placing" && <span className="text-slate-500 dark:text-slate-400">↓ Click any square to place the knight</span>}
              {phase==="playing" && <span className="text-slate-500 dark:text-slate-400">{order.length} <span className="opacity-60">/ {total}</span> squares</span>}
              {phase==="done"    && <span className={score>=2?"text-emerald-400":"text-amber-400"}>{resultMsg}</span>}
            </div>

            <div className="flex gap-1">
              <div className="flex flex-col shrink-0" style={{width:18}}>
                {Array.from({length:rows}, (_,r) => (
                  <div key={r} className="flex flex-1 items-center justify-center font-mono text-[10px] text-slate-500">
                    {rows - r}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="w-full rounded-lg border border-slate-700/40 overflow-hidden"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols},1fr)`,
                    gridTemplateRows: `repeat(${rows},1fr)`,
                    aspectRatio: `${cols} / ${rows}`,
                  }}>
                  {Array.from({length: rows * cols}, (_, idx) => {
                    const r = Math.floor(idx / cols), c = idx % cols;
                    const isBlockedCell = !!blocked[r]?.[c];
                    const isLight    = (r+c)%2===0;
                    const isKnight   = pos?.[0]===r && pos?.[1]===c;
                    const isStart    = start?.[0]===r && start?.[1]===c;
                    const isVisited  = !!vis[r]?.[c];
                    const moveIdx    = order.findIndex(([or,oc]) => or===r && oc===c);
                    const isValid    = validMoves.some(([vr,vc]) => vr===r && vc===c);
                    const isHintCell = showHint && hintCell?.[0]===r && hintCell?.[1]===c;
                    const isEndpoint = lockedEndpoint?.[0]===r && lockedEndpoint?.[1]===c;
                    const canClick   = !isBlockedCell && (phase==="placing" || isValid);
                    return (
                      <div key={idx} onClick={() => handleClick(r, c)}
                        style={{ backgroundColor: isLight ? theme.lightSq : theme.darkSq }}
                        className={`relative flex items-center justify-center select-none overflow-hidden transition-[filter] duration-100
                          ${canClick ? "cursor-pointer hover:brightness-110 active:brightness-95" : ""}`}>
                        {isBlockedCell && (
                          <><div className="absolute inset-0 bg-slate-950/90 dark:bg-black/90 z-10"/>
                          <span className="absolute z-20 font-mono text-slate-700 dark:text-slate-800 leading-none" style={{fontSize:"clamp(7px,1.4vw,12px)"}}>✕</span></>
                        )}
                        {!isBlockedCell && isVisited && (
                          <div className="absolute inset-0" style={{ backgroundColor: isStart ? theme.visitedFrom : theme.visited }}/>
                        )}
                        {!isBlockedCell && isValid && !isHintCell && (
                          <div className="absolute inset-0" style={{ backgroundColor: theme.valid, boxShadow: `inset 0 0 0 2px ${theme.validRing}` }}/>
                        )}
                        {!isBlockedCell && isHintCell && (
                          <motion.div className="absolute inset-0"
                            style={{ backgroundColor: theme.hint, boxShadow: `inset 0 0 0 2px ${theme.hintRing}` }}
                            animate={{opacity:[0.6,1,0.6]}} transition={{repeat:Infinity,duration:1.2}}/>
                        )}
                        {!isBlockedCell && isVisited && moveIdx >= 0 && (
                          <span className="absolute left-[3px] top-[2px] font-mono leading-none"
                            style={{fontSize:"clamp(6px,1.3vw,10px)", color: isKnight ? "rgba(255,255,255,0.75)" : theme.accentText}}>
                            {moveIdx+1}
                          </span>
                        )}
                        {!isBlockedCell && isValid && !isVisited && (
                          <span className="absolute bottom-[2px] right-[2px] font-mono leading-none" style={{fontSize:"clamp(5px,1vw,9px)", color: theme.accentText, opacity: 0.55}}>
                            {notation(r, c, rows)}
                          </span>
                        )}
                        {!isBlockedCell && isValid && !isHintCell && (
                          <div className="w-[22%] h-[22%] rounded-full z-10" style={{ backgroundColor: theme.validDot }}/>
                        )}
                        {!isBlockedCell && isHintCell && (
                          <motion.div className="w-[28%] h-[28%] rounded-full z-10" style={{ backgroundColor: theme.hintRing }}
                            animate={{scale:[1,1.25,1]}} transition={{repeat:Infinity,duration:1.2}}/>
                        )}
                        {!isBlockedCell && isEndpoint && !isVisited && !isKnight && (
                          <motion.div className="absolute inset-0 flex items-center justify-center z-10"
                            initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}}
                            transition={{type:"spring",bounce:0.3}}>
                            <span className="drop-shadow select-none" style={{fontSize:"clamp(11px,3.2vw,26px)"}}>{theme.endpoint}</span>
                            <span className="absolute top-[1px] left-[2px] font-mono font-bold leading-none"
                              style={{fontSize:"clamp(6px,1.2vw,10px)", color: theme.accentText}}>
                              {total}
                            </span>
                          </motion.div>
                        )}
                        {!isBlockedCell && isKnight && (
                          <motion.div layoutId="knight-piece" className="absolute inset-0 flex items-center justify-center z-20"
                            transition={{type:"spring",bounce:0.25,duration:0.38}}>
                            <span className="drop-shadow-lg select-none" role="img" aria-label="knight"
                              style={{fontSize:"clamp(12px,3.5vw,28px)"}}>{knightGlyph}</span>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex mt-1">
                  {Array.from({length:cols}, (_,c) => (
                    <div key={c} className="flex-1 text-center font-mono text-[10px] text-slate-500">
                      {String.fromCharCode(97+c)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Controls ───────────────────────────────────────────────────── */}
          <div className="w-full lg:w-60 xl:w-64 flex flex-col gap-3 lg:sticky lg:top-6">

            <div className="rounded-xl border border-slate-200/60 bg-white/60 dark:border-slate-700/40 dark:bg-slate-800/30 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Score</div>
              <div className="flex items-end gap-2">
                <span className={`font-mono font-bold leading-none ${
                  score===3?"text-emerald-400 text-5xl":score===2?"text-sky-400 text-5xl":score>0?"text-amber-400 text-3xl":"text-slate-500 text-5xl"
                }`}>
                  {phase==="done" ? (score>=1 ? score.toString() : scoreLabel) : phase==="playing" ? order.length : "—"}
                </span>
                {phase==="done" && score>=1 && <span className="text-slate-400 text-sm mb-0.5">pts</span>}
              </div>
              {scoreLabel && phase==="done" && (
                <div className={`mt-1 font-mono text-xs ${score===3?"text-emerald-400":score===2?"text-sky-400":"text-amber-400"}`}>
                  {scoreLabel}
                </div>
              )}
              {phase==="playing" && (
                <div className="mt-3 h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div className="h-full rounded-full bg-sky-400" initial={{width:0}}
                    animate={{width:`${progress*100}%`}} transition={{duration:0.3}}/>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={onHint} disabled={phase!=="playing"||!hintCell}
                className="flex items-center gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-2.5 text-sm text-amber-400 transition-colors hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-30">
                <Lightbulb size={14}/>Warnsdorff Hint
              </button>
              <button onClick={undo} disabled={hist.length===0||phase!=="playing"}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30 disabled:cursor-not-allowed disabled:opacity-30">
                <Undo2 size={14}/>Undo
                {hist.length>0 && <span className="ml-auto font-mono text-xs text-slate-400">×{hist.length}</span>}
              </button>
              <button onClick={() => reset(rows, cols)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/30">
                <RotateCcw size={14}/>New Game
              </button>
              <button onClick={() => { setShowLb(true); setLbTab("global"); }}
                className="flex items-center gap-2.5 rounded-xl border border-violet-400/30 bg-violet-400/5 px-4 py-2.5 text-sm text-violet-400 transition-colors hover:bg-violet-400/10">
                <Trophy size={14}/>Leaderboard
                {globalLb.length>0 && <span className="ml-auto font-mono text-xs text-slate-500">{globalLb.length}</span>}
                {USE_SB && <Globe size={11} className="text-emerald-400/70"/>}
              </button>
              <button onClick={() => {
                  // Sync string buffers with current numeric state on open so
                  // the inputs show the right initial value.
                  setCfRowsStr(String(cfRows)); setCfColsStr(String(cfCols));
                  setCfRowStr(String(cfRow));   setCfColStr(String(cfCol));
                  setShowSandbox(true);
                }}
                className="flex items-center gap-2.5 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-emerald-400/10">
                <Plus size={14}/>Create Challenge
              </button>
              <button onClick={() => adminMode ? setAdminMode(false) : setShowAdminLogin(true)}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                  adminMode
                    ? "border-rose-400/30 bg-rose-400/5 text-rose-400 hover:bg-rose-400/10"
                    : "border-slate-200/40 dark:border-slate-700/30 text-slate-500 hover:text-slate-400 bg-transparent"
                }`}>
                {adminMode ? <ShieldCheck size={14}/> : <Lock size={14}/>}
                {adminMode ? "Admin Active" : "Admin"}
                {adminMode && pendingCount>0 && (
                  <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 font-mono text-[9px] text-white">{pendingCount}</span>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">Legend</div>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                {[
                  { overlay: theme.visited,     label: "Visited" },
                  { overlay: theme.visitedFrom, label: "Start square" },
                  { overlay: theme.valid, ring: theme.validRing, dot: theme.validDot, label: "Valid move" },
                  { overlay: theme.hint,  ring: theme.hintRing,  dot: theme.hintRing, label: "Warnsdorff hint" },
                ].map(({ overlay, ring, dot, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    {/* Half-split preview so the user sees how the overlay
                        actually looks on both light + dark squares — alpha
                        blending differs noticeably between the two. */}
                    <div
                      className="w-4 h-4 rounded shrink-0 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${theme.lightSq} 50%, ${theme.darkSq} 50%)`,
                        boxShadow: ring ? `inset 0 0 0 2px ${ring}` : undefined,
                      }}>
                      {overlay && <div className="absolute inset-0" style={{ backgroundColor: overlay }}/>}
                      {dot     && <div className="absolute inset-[28%] rounded-full" style={{ backgroundColor: dot }}/>}
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded shrink-0 bg-slate-950 flex items-center justify-center">
                    <span className="text-slate-700 font-mono text-[8px]">✕</span>
                  </div>
                  <span>Removed square</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-center text-base leading-none">{knightGlyph}</span>
                  <span>Knight (current)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/60 bg-white/40 dark:border-slate-700/40 dark:bg-slate-800/20 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">Scoring</div>
              <div className="space-y-2 text-xs">
                {[
                  {label:"Closed Tour",sub:"All squares + return",pts:"3 pts",color:"text-emerald-400"},
                  {label:"Open Tour",  sub:"All squares visited", pts:"2 pts",color:"text-sky-400"},
                  {label:"Partial",    sub:"As many as you can",  pts:`X/${total}`,color:"text-amber-400"},
                ].map(({label,sub,pts,color}) => (
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
              <Info size={13} className="shrink-0 mt-0.5"/>
              <span>Full tours (Open/Closed) go to the global leaderboard. Partial scores stay in &quot;Mine&quot;.</span>
            </div>
          </div>
        </div>
      </main>
      <Footer/>

      {/* ── Name / result dialog ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showNameDlg && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl"
              initial={{scale:0.88,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}}
              exit={{scale:0.88,opacity:0,y:16}} transition={{type:"spring",bounce:0.25,duration:0.4}}>
              <div className={`mb-1 text-2xl font-bold ${score===3?"text-emerald-400":score===2?"text-sky-400":"text-amber-400"}`}>
                {score===3?"♞ Closed Tour!":score===2?"♞ Open Tour!":`♞ ${scoreLabel}`}
              </div>
              <p className="mb-1 text-sm text-slate-400">{resultMsg}</p>
              <p className="mb-2 font-mono text-xs text-slate-500">
                Time: {fmtTime(secs)} · Moves: {order.length} · Board: {rows}×{cols}
              </p>
              {isFullTour(score) && USE_SB ? (
                <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 text-xs text-emerald-400">
                  <Globe size={11}/>Full tour — will be shared to the global leaderboard
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 px-3 py-2 text-xs text-amber-400">
                  <User size={11}/>Partial score — saved to &quot;Mine&quot; only
                </div>
              )}
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Your name
              </label>
              <input autoFocus value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setNameErr(""); }}
                onKeyDown={(e) => e.key==="Enter" && saveEntry(nameInput)}
                placeholder="Anonymous"
                className={`mb-1 w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors ${nameErr?"border-rose-400/60":"border-slate-700 focus:border-sky-400/60"}`}
              />
              {nameErr && <div className="mb-3 flex items-center gap-1.5 text-xs text-rose-400"><AlertCircle size={12}/><span>{nameErr}</span></div>}
              {!nameErr && <div className="mb-3"/>}
              <div className="flex gap-2.5">
                <button onClick={() => saveEntry(nameInput)}
                  className="flex-1 rounded-xl bg-sky-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-400">
                  Save &amp; View Leaderboard
                </button>
                <button onClick={() => { setShowNameDlg(false); reset(rows, cols); }}
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
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setShowLb(false)}>
            <motion.div className="flex w-full max-w-md flex-col rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl"
              style={{maxHeight:"84vh"}}
              initial={{scale:0.88,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}}
              exit={{scale:0.88,opacity:0,y:16}} transition={{type:"spring",bounce:0.2,duration:0.4}}
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400"/>
                  <span className="font-semibold text-slate-100">Leaderboard</span>
                </div>
                <div className="flex items-center gap-2">
                  {adminMode && (
                    <span className="flex items-center gap-1 rounded-md bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] text-rose-400">
                      <ShieldCheck size={10}/>ADMIN
                    </span>
                  )}
                  <button onClick={() => adminMode ? setAdminMode(false) : setShowAdminLogin(true)}
                    className={`rounded-lg p-1.5 transition-colors ${adminMode?"text-rose-400 hover:bg-rose-400/10":"text-slate-500 hover:text-slate-200 hover:bg-slate-800"}`}>
                    {adminMode ? <ShieldCheck size={15}/> : <Lock size={15}/>}
                  </button>
                  <button onClick={() => setShowLb(false)} className="text-slate-500 hover:text-slate-200 transition-colors">
                    <X size={17}/>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 shrink-0">
                {([
                  { id: "global" as LbTab, label: "Global", icon: <Globe size={11}/>, badge: null },
                  { id: "mine"   as LbTab, label: "Mine",   icon: <User size={11}/>,  badge: null },
                  ...(adminMode ? [{ id: "challenges" as LbTab, label: "Challenges", icon: <Plus size={11}/>, badge: pendingCount > 0 ? pendingCount : null }] : []),
                ]).map(({ id, label, icon, badge }) => (
                  <button key={id} onClick={() => setLbTab(id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-mono transition-colors ${
                      lbTab === id
                        ? id==="global" ? "border-b-2 border-violet-400 text-violet-400"
                        : id==="mine"   ? "border-b-2 border-sky-400 text-sky-400"
                        :                 "border-b-2 border-emerald-400 text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}>
                    {icon}{label}
                    {badge != null && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-400 font-mono text-[9px] text-white">{badge}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">

                {/* Global tab */}
                {lbTab === "global" && (() => {
                  if (lbLoading) return <div className="py-10 text-center text-sm text-slate-600">Loading…</div>;
                  if (lbError) return (
                    <div className="py-10 px-4 rounded-lg border border-red-500/40 bg-red-500/10 text-xs font-mono text-red-300 whitespace-pre-wrap break-words">
                      <div className="font-semibold mb-1 text-red-200">Leaderboard yüklenemedi</div>
                      {lbError}
                    </div>
                  );
                  if (globalLb.length === 0) return (
                    <div className="py-12 text-center space-y-1">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="text-sm text-slate-500">No full tours yet.</div>
                      <div className="text-xs text-slate-700">Complete an Open or Closed Tour to appear here.</div>
                    </div>
                  );

                  const standardEntries  = globalLb.filter(e => !e.challengeId);
                  const communityEntries = globalLb.filter(e =>  e.challengeId);

                  // unique board sizes for standard entries, sorted by area desc
                  const boardSizes = Array.from(new Set(standardEntries.map(e => `${e.rows}×${e.cols}`))).sort((a, b) => {
                    const [ar, ac] = a.split("×").map(Number);
                    const [br, bc] = b.split("×").map(Number);
                    return br * bc - ar * ac;
                  });

                  // unique challenges for community entries
                  const challengeGroups = Array.from(
                    communityEntries.reduce((map, e) => {
                      const key = e.challengeId!;
                      if (!map.has(key)) map.set(key, { title: e.challengeTitle ?? key, entries: [] });
                      map.get(key)!.entries.push(e);
                      return map;
                    }, new Map<string, { title: string; entries: LBEntry[] }>())
                  ).map(([id, v]) => ({ id, ...v }));

                  const showStandard  = lbSection !== "community";
                  const showCommunity = lbSection !== "standard";

                  // LB entry card (shared between standard and community)
                  const EntryCard = ({ e, i, globalIdx }: { e: LBEntry; i: number; globalIdx: number }) => {
                    const diamond = isDiamond(e);
                    const streak  = e.streak ?? 1;
                    // Group a player's entries by player_id when available,
                    // else fall back to lowercase name matching.
                    const samePlayer = (x: LBEntry) =>
                      e.playerId && x.playerId
                        ? x.playerId === e.playerId
                        : x.name.trim().toLowerCase() === e.name.trim().toLowerCase();
                    return (
                    <div key={e.id ?? globalIdx}
                      onClick={() => e.path?.length ? setSolutionEntry(e) : undefined}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-colors group
                        ${diamond ? "border border-cyan-300/40 bg-cyan-300/[0.06]" : i === 0 ? "border border-amber-400/25 bg-amber-400/[0.06]" : "bg-slate-800/40"}
                        ${e.path?.length ? "cursor-pointer hover:bg-slate-700/50" : ""}`}>
                      <span className="w-6 shrink-0 text-center font-mono text-sm">
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span className="text-slate-600">{i+1}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-sm text-slate-200 min-w-0">
                          {diamond && <span title="Kusursuz: ipucu yok, geri alma yok, kapalı tur" className="shrink-0">💎</span>}
                          <button
                            onClick={(ev) => { ev.stopPropagation(); setPlayerEntries({ name: e.name, entries: globalLb.filter(samePlayer) }); }}
                            className="truncate font-medium hover:text-sky-400 transition-colors text-left">
                            {e.name}
                          </button>
                          {streak >= 2 && (
                            <span title={`${streak} farklı çözüm art arda`} className="shrink-0 font-mono text-[10px] text-orange-400">
                              {streak}x🔥
                            </span>
                          )}
                          {e.path?.length && <Play size={8} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-400 shrink-0"/>}
                        </div>
                        <div className="font-mono text-[10px] text-slate-600">
                          {e.label} · {e.rows}×{e.cols} · {e.date}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`font-mono text-sm font-bold ${e.score===3?"text-emerald-400":"text-sky-400"}`}>
                          {e.score===3?"Closed":"Open"}
                        </div>
                        <div className="font-mono text-[10px] text-slate-600">{fmtTime(e.secs)}</div>
                      </div>
                      {adminMode && (
                        <button onClick={(ev) => { ev.stopPropagation(); deleteGlobal(e, globalLb.indexOf(e)); }}
                          className="ml-1 rounded-lg p-1.5 text-slate-600 hover:bg-rose-400/10 hover:text-rose-400 transition-colors">
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                    );
                  };

                  return (
                    <>
                      {/* Section filter */}
                      {communityEntries.length > 0 && (
                        <div className="flex gap-1.5 pb-3">
                          {(["all","standard","community"] as LbSection[]).map((s) => (
                            <button key={s} onClick={() => setLbSection(s)}
                              className={`rounded-lg px-2.5 py-1 font-mono text-[10px] capitalize transition-colors ${
                                lbSection === s
                                  ? "bg-violet-400/20 text-violet-400 border border-violet-400/40"
                                  : "text-slate-500 border border-slate-700/60 hover:text-slate-300"
                              }`}>{s}</button>
                          ))}
                        </div>
                      )}

                      {/* ── Standard boards ── */}
                      {showStandard && standardEntries.length > 0 && (
                        <>
                          {communityEntries.length > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Standard</span>
                              <div className="flex-1 h-px bg-slate-800"/>
                            </div>
                          )}
                          {/* Board size filter for standard */}
                          {boardSizes.length > 1 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {["all", ...boardSizes].map(size => (
                                <button key={size} onClick={() => setLbBoardFilter(size)}
                                  className={`rounded-lg px-2 py-0.5 font-mono text-[10px] transition-colors ${
                                    lbBoardFilter === size
                                      ? "bg-slate-700 text-slate-200 border border-slate-600"
                                      : "text-slate-600 border border-slate-800 hover:text-slate-400"
                                  }`}>{size === "all" ? "All sizes" : size}</button>
                              ))}
                            </div>
                          )}
                          <div className="space-y-2 mb-4">
                            {standardEntries
                              .filter(e => lbBoardFilter === "all" || `${e.rows}×${e.cols}` === lbBoardFilter)
                              .map((e, i) => <EntryCard key={e.id ?? i} e={e} i={i} globalIdx={i}/>)}
                          </div>
                        </>
                      )}

                      {/* ── Community challenges ── */}
                      {showCommunity && challengeGroups.length > 0 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-500/70">Community</span>
                            <div className="flex-1 h-px bg-slate-800"/>
                          </div>
                          {challengeGroups.map(({ id, title, entries }) => (
                            <div key={id} className="mb-4">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[11px] font-medium text-slate-300 truncate">{title}</span>
                                <span className="shrink-0 font-mono text-[9px] text-slate-600">{entries[0].rows}×{entries[0].cols}</span>
                                <span className="shrink-0 font-mono text-[9px] text-emerald-500/60">
                                  {entries.length} solver{entries.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {entries.sort(cmpLB).map((e, i) => (
                                  <EntryCard key={e.id ?? i} e={e} i={i} globalIdx={i}/>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}

                {/* Mine tab */}
                {lbTab === "mine" && (
                  localLb.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-600">No local scores yet. Play a game!</div>
                  ) : localLb.map((e, i) => (
                    <div key={i}
                      onClick={() => e.path?.length ? setSolutionEntry(e) : undefined}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-colors group
                        ${e.score>=2 ? "border border-sky-400/15 bg-sky-400/[0.04]" : "bg-slate-800/40"}
                        ${e.path?.length ? "cursor-pointer hover:bg-slate-700/50" : ""}`}>
                      <span className="w-6 shrink-0 text-center font-mono text-base">
                        {e.score===3?"🟢":e.score===2?"🔵":"🟡"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 truncate text-sm text-slate-200">
                          {e.name}
                          {e.path?.length && <Play size={8} className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-400 shrink-0"/>}
                        </div>
                        <div className="font-mono text-[10px] text-slate-600">
                          {e.label} · {e.rows}×{e.cols} · {e.date}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`font-mono text-sm font-bold ${e.score===3?"text-emerald-400":e.score===2?"text-sky-400":"text-amber-400"}`}>
                          {e.score>=1 ? `${e.score} pts` : e.label}
                        </div>
                        <div className="font-mono text-[10px] text-slate-600">{fmtTime(e.secs)}</div>
                      </div>
                      {adminMode && (
                        <button onClick={(ev) => { ev.stopPropagation(); deleteLocal(i); }}
                          className="ml-1 rounded-lg p-1.5 text-slate-600 hover:bg-rose-400/10 hover:text-rose-400 transition-colors">
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </div>
                  ))
                )}

                {/* Challenges tab (admin only) */}
                {lbTab === "challenges" && adminMode && (
                  challenges.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-600">No submissions yet.</div>
                  ) : challenges.map((ch) => (
                    <div key={ch.id} className={`rounded-xl border p-3 ${
                      ch.status==="approved"?"border-emerald-400/20 bg-emerald-400/[0.04]"
                      :ch.status==="pending"?"border-slate-700 bg-slate-800/40"
                      :"border-slate-800 bg-slate-800/20 opacity-50"
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200 truncate">{ch.title}</div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {ch.rows}×{ch.cols}
                            {ch.blockedSquares?.length ? ` · ${ch.blockedSquares.length} removed` : ""}
                            {ch.startRow!==null ? ` · Start: ${notation(ch.startRow, ch.startCol!, ch.rows)}` : " · Free start"}
                            {" · "}{new Date(ch.submittedAt).toLocaleDateString()}
                          </div>
                          {ch.description && <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{ch.description}</p>}
                        </div>
                        <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[9px] ${
                          ch.status==="pending"?"bg-amber-400/10 text-amber-400"
                          :ch.status==="approved"?"bg-emerald-400/10 text-emerald-400"
                          :"bg-slate-700 text-slate-500"
                        }`}>{ch.status}</span>
                      </div>
                      {ch.status==="pending" && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <button onClick={() => { setPreviewChallenge(ch); }}
                            className="rounded-lg border border-slate-600 px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors">
                            Preview
                          </button>
                          {(["standard","advanced","expert"] as const).map((cat) => (
                            <button key={cat} onClick={() => reviewChallenge(ch.id, "approved", cat)}
                              className={`rounded-lg border px-2 py-1 text-[10px] font-mono transition-colors ${
                                cat==="expert"   ?"border-rose-400/30 text-rose-400 hover:bg-rose-400/10"
                                :cat==="advanced"?"border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                                :"border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                              }`}>
                              <Check size={9} className="inline mr-0.5"/>{cat}
                            </button>
                          ))}
                          <button onClick={() => reviewChallenge(ch.id, "rejected")}
                            className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-mono text-slate-500 hover:text-rose-400 transition-colors">
                            Reject
                          </button>
                          <button onClick={() => removeChallenge(ch.id)} className="ml-auto rounded-lg p-1 text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      )}
                      {ch.status==="approved" && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`rounded-md px-1.5 py-0.5 font-mono text-[9px] ${
                            ch.category==="expert"  ?"bg-rose-400/10 text-rose-400"
                            :ch.category==="advanced"?"bg-amber-400/10 text-amber-400"
                            :"bg-emerald-400/10 text-emerald-400"
                          }`}>{ch.category}</span>
                          <button onClick={() => setPreviewChallenge(ch)}
                            className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors">Preview</button>
                          <button onClick={() => reviewChallenge(ch.id, "rejected")}
                            className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors">Revoke</button>
                          <button onClick={() => removeChallenge(ch.id)} className="ml-auto rounded-lg p-1 text-slate-600 hover:text-rose-400 transition-colors">
                            <Trash2 size={12}/>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-800 px-5 py-3 flex justify-between items-center shrink-0">
                <span className="font-mono text-[10px] text-slate-600">
                  {lbTab==="global" ? "Full tours · click to replay" : lbTab==="mine" ? "Your scores · click to replay" : "Admin · challenges"}
                </span>
                {adminMode && lbTab==="mine" && localLb.length>0 && (
                  <button onClick={() => { setLocalLb([]); try { localStorage.removeItem("kt-lb-local"); } catch { /* */ } }}
                    className="font-mono text-[10px] text-slate-600 hover:text-rose-400 transition-colors">
                    Clear mine
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
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => { setShowAdminLogin(false); setAdminPw(""); setAdminPwErr(""); }}>
            <motion.div className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
              initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
              transition={{type:"spring",bounce:0.2,duration:0.35}}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={15} className="text-slate-400"/>
                <span className="font-semibold text-slate-200">Admin Access</span>
              </div>
              <input autoFocus type="password" value={adminPw}
                onChange={(e) => { setAdminPw(e.target.value); setAdminPwErr(""); }}
                onKeyDown={(e) => e.key==="Enter" && tryLogin()}
                placeholder="Password"
                className={`w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors mb-2 ${adminPwErr?"border-rose-400/60":"border-slate-700 focus:border-sky-400/60"}`}
              />
              {adminPwErr && (
                <div className="mb-2 flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle size={11}/><span>{adminPwErr}</span>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create Challenge modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSandbox && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => setShowSandbox(false)}>
            <motion.div className="flex w-full max-w-sm flex-col rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl"
              style={{maxHeight:"90vh"}}
              initial={{scale:0.88,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}}
              exit={{scale:0.88,opacity:0,y:16}} transition={{type:"spring",bounce:0.2,duration:0.4}}
              onClick={(e) => e.stopPropagation()}>

              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Plus size={15} className="text-emerald-400"/>
                  <span className="font-semibold text-slate-100">Create a Challenge</span>
                </div>
                <button onClick={() => setShowSandbox(false)} className="text-slate-500 hover:text-slate-200"><X size={17}/></button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500">Title</label>
                <input value={cfTitle} onChange={(e) => setCfTitle(e.target.value)}
                  placeholder={`${cfRows}×${cfCols} Challenge`}
                  className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-400/60 transition-colors"/>

                <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500">Board Dimensions (1–16)</label>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[9px] text-slate-600 uppercase">Rows</span>
                    {/* text + inputMode numeric so mobile keyboards show a
                        number pad but let the user fully clear the field;
                        clamping only happens on blur. */}
                    <input type="text" inputMode="numeric" pattern="[0-9]*"
                      value={cfRowsStr}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setCfRowsStr(v);
                        if (v !== "") { const n = parseInt(v); if (!isNaN(n)) setCfRows(n); }
                      }}
                      onBlur={() => {
                        const n = Math.min(16, Math.max(1, parseInt(cfRowsStr)||1));
                        setCfRows(n); setCfRowsStr(String(n));
                      }}
                      className="w-16 rounded-xl border border-slate-700 bg-slate-800 px-2 py-2 text-center font-mono text-sm text-slate-200 outline-none focus:border-sky-400/60 transition-colors"/>
                  </div>
                  <span className="text-slate-600 text-lg mt-4">×</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-[9px] text-slate-600 uppercase">Cols</span>
                    <input type="text" inputMode="numeric" pattern="[0-9]*"
                      value={cfColsStr}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setCfColsStr(v);
                        if (v !== "") { const n = parseInt(v); if (!isNaN(n)) setCfCols(n); }
                      }}
                      onBlur={() => {
                        const n = Math.min(16, Math.max(1, parseInt(cfColsStr)||1));
                        setCfCols(n); setCfColsStr(String(n));
                      }}
                      className="w-16 rounded-xl border border-slate-700 bg-slate-800 px-2 py-2 text-center font-mono text-sm text-slate-200 outline-none focus:border-sky-400/60 transition-colors"/>
                  </div>
                  <span className="text-slate-500 font-mono text-xs mt-4">= {cfRows*cfCols} sq.</span>
                </div>

                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Board Shape — click to remove squares
                </label>
                {/* Scrollable grid with fixed 28px cells so large boards remain usable */}
                <div className="mb-1 overflow-auto rounded-lg border border-slate-700/60 max-h-56">
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cfCols}, 28px)`,
                    width: cfCols * 28,
                  }}>
                    {Array.from({length: cfRows * cfCols}, (_, idx) => {
                      const br = Math.floor(idx / cfCols), bc = idx % cfCols;
                      const isRemoved = cfBlocked.some(([r,c]) => r===br && c===bc);
                      const isStartSq = cfFixed && br===cfRow && bc===cfCol;
                      const isLightSq = (br+bc)%2===0;
                      return (
                        <div key={idx} onClick={() => toggleCfBlock(br, bc)}
                          style={{ width: 28, height: 28 }}
                          className={`cursor-pointer select-none flex items-center justify-center border-[0.5px] border-black/10 transition-colors
                            ${isRemoved ? "bg-slate-950" : isStartSq ? "bg-violet-500/50" : isLightSq ? "bg-slate-300 hover:bg-slate-400/60" : "bg-slate-500 hover:bg-slate-400"}`}>
                          {isRemoved  && <span className="text-slate-700 font-mono text-[9px]">✕</span>}
                          {isStartSq && !isRemoved && <span className="text-[10px]">♞</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{cfRows*cfCols - cfBlocked.length} active squares</span>
                  {cfBlocked.length>0 && <button onClick={() => setCfBlocked([])} className="text-slate-600 hover:text-slate-400 transition-colors">Reset shape</button>}
                </div>

                <button onClick={() => setCfFixed(!cfFixed)}
                  className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors ${cfFixed?"border-sky-400/40 bg-sky-400/10 text-sky-400":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>
                  {cfFixed ? <Check size={11}/> : <Plus size={11}/>} Fixed start position
                </button>

                {cfFixed && (
                  <div className="mb-4 flex items-center gap-3">
                    <div>
                      <label className="mb-0.5 block font-mono text-[9px] uppercase text-slate-600">Row (0–{cfRows-1})</label>
                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={cfRowStr}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "");
                          setCfRowStr(v);
                          if (v !== "") { const n = parseInt(v); if (!isNaN(n)) setCfRow(n); }
                        }}
                        onBlur={() => {
                          const n = Math.min(cfRows-1, Math.max(0, parseInt(cfRowStr)||0));
                          setCfRow(n); setCfRowStr(String(n));
                        }}
                        className="w-16 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center font-mono text-sm text-slate-200 outline-none"/>
                    </div>
                    <div>
                      <label className="mb-0.5 block font-mono text-[9px] uppercase text-slate-600">Col (0–{cfCols-1})</label>
                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={cfColStr}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "");
                          setCfColStr(v);
                          if (v !== "") { const n = parseInt(v); if (!isNaN(n)) setCfCol(n); }
                        }}
                        onBlur={() => {
                          const n = Math.min(cfCols-1, Math.max(0, parseInt(cfColStr)||0));
                          setCfCol(n); setCfColStr(String(n));
                        }}
                        className="w-16 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center font-mono text-sm text-slate-200 outline-none"/>
                    </div>
                    <div className="mt-4 font-mono text-xs text-slate-400">= {notation(cfRow, cfCol, cfRows)}</div>
                  </div>
                )}

                <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-slate-500">Notes (optional)</label>
                <textarea value={cfDesc} onChange={(e) => setCfDesc(e.target.value)} rows={2}
                  placeholder="Describe your challenge…"
                  className="mb-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-400/60 transition-colors"/>

                <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-400/80 flex gap-2">
                  <Info size={11} className="shrink-0 mt-0.5"/>
                  {USE_SB
                    ? "Challenges are submitted globally — admin reviews before they go live for everyone."
                    : "Submitted challenges are reviewed by the admin before appearing in Community Boards."}
                </div>
              </div>

              <div className="border-t border-slate-800 px-6 py-4 shrink-0">
                <button onClick={submitChallenge}
                  className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-400">
                  Submit Challenge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Solution Viewer ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {solutionEntry && (
          <SolutionViewer entry={solutionEntry} onClose={() => setSolutionEntry(null)}/>
        )}
      </AnimatePresence>

      {/* ── Challenge Preview ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewChallenge && (
          <ChallengePreviewModal challenge={previewChallenge} onClose={() => setPreviewChallenge(null)}/>
        )}
      </AnimatePresence>

      {/* ── Player Profile ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {playerEntries && (
          <PlayerModal
            playerName={playerEntries.name}
            entries={playerEntries.entries}
            onClose={() => setPlayerEntries(null)}
            onViewSolution={(e) => { setPlayerEntries(null); setSolutionEntry(e); }}
          />
        )}
      </AnimatePresence>

      {/* ── Princess & Knight Story Intro ─────────────────────────────────── */}
      <AnimatePresence>
        {showStoryIntro && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowStoryIntro(false)}>
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-pink-300/30 shadow-2xl"
              style={{ background: "linear-gradient(145deg, #2B0F1F 0%, #4A1B36 55%, #2B0F1F 100%)" }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}>

              {/* Ambient floating hearts */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.span key={i}
                    className="absolute select-none"
                    style={{
                      left: `${(i * 37) % 100}%`,
                      top: `${(i * 71) % 100}%`,
                      fontSize: 14 + (i % 3) * 6,
                      opacity: 0.18,
                    }}
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4 + (i % 4),
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}>
                    {i % 2 === 0 ? "💗" : "✨"}
                  </motion.span>
                ))}
              </div>

              <div className="relative p-7 text-pink-50">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-3xl">🏰</span>
                  <h2 className="font-serif text-xl font-semibold tracking-wide text-pink-100">
                    Şato ve Şövalye
                  </h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-pink-100/90">
                  <p>
                    Güneşli bir sabah, cesur Şövalye, 64 odalı renkli büyülü
                    şatoya doğru yola çıkar. Yaramaz bir büyücü, Prenses&apos;i
                    şatonun en uzak kulesine saklamıştır.
                  </p>
                  <p>
                    Bilgeler der ki büyü yalnızca tek bir şekilde çözülür:
                    Şövalye, her odadan{" "}
                    <em className="text-pink-300">yalnızca bir kez</em> geçerek
                    Prenses&apos;e ulaşmalı ve ardından başladığı odaya geri
                    dönebilmelidir.
                  </p>
                  <p className="text-pink-300/90 italic">
                    Her L-biçimli adım küçük bir bulmaca; dikkatle seçilen her
                    hamle, hikâyenin mutlu sonuna bir adım daha yakın...
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-pink-300/60">
                    🤴🏼 → 👸🏼
                  </span>
                  <button
                    onClick={() => {
                      setShowStoryIntro(false);
                      try { localStorage.setItem("kt-princess-intro-seen", "1"); } catch { /* */ }
                    }}
                    className="rounded-xl bg-pink-400/20 border border-pink-300/40 px-5 py-2 font-serif text-sm text-pink-100 transition-colors hover:bg-pink-400/30 hover:border-pink-300/60">
                    Yolculuğa Başla
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Victory Overlay (score=3) ─────────────────────────────────────── */}
      <AnimatePresence>
        {victoryActive && (
          <VictoryOverlay
            variant={theme.victory}
            onDone={() => setVictoryActive(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Princess Failure Story ─────────────────────────────────────────── */}
      <AnimatePresence>
        {failureStory && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFailureStory(null)}>
            <motion.div
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-pink-200/20 shadow-2xl"
              style={{ background: "linear-gradient(160deg, #1A0B1A 0%, #3B1937 55%, #1A0B1A 100%)" }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
              onClick={(e) => e.stopPropagation()}>

              {/* Gentle falling sparkles — not tears, just drifting hope */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 14 }).map((_, i) => (
                  <motion.span key={i}
                    className="absolute select-none text-pink-200/25"
                    style={{
                      left: `${(i * 29) % 100}%`,
                      top: `-10%`,
                      fontSize: 10 + (i % 3) * 4,
                    }}
                    animate={{
                      y: ["0vh", "120vh"],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{
                      duration: 6 + (i % 4),
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear",
                    }}>
                    {i % 3 === 0 ? "✦" : i % 3 === 1 ? "•" : "✧"}
                  </motion.span>
                ))}
              </div>

              <div className="relative p-7 text-pink-50">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">🪄</span>
                  <h2 className="font-serif text-lg font-semibold tracking-wide text-pink-100">
                    Bu Sefer Ulaşamadık...
                  </h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-pink-100/90">
                  <p dangerouslySetInnerHTML={{ __html: failureStory.fate }}/>
                  <p className="border-l-2 border-pink-300/40 pl-3 text-pink-100/80"
                     dangerouslySetInnerHTML={{ __html: failureStory.hope }}/>
                </div>

                <div className="mt-5 rounded-xl border border-pink-200/15 bg-pink-300/[0.04] p-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-pink-200/70">
                    <span>Bu turdaki ilerleme</span>
                    <span className="text-pink-200">{order.length} / {total}</span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-pink-950/50">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-200 transition-all"
                      style={{ width: `${Math.min(100, (order.length / Math.max(total, 1)) * 100)}%` }}/>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setFailureStory(null);
                      setShowNameDlg(true);
                    }}
                    className="rounded-xl border border-pink-200/20 px-4 py-2 font-mono text-[11px] text-pink-100/70 transition-colors hover:bg-pink-400/10 hover:text-pink-100">
                    Skoru Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setFailureStory(null);
                      reset(rows, cols);
                    }}
                    className="rounded-xl bg-pink-400/20 border border-pink-300/40 px-5 py-2 font-serif text-sm text-pink-100 transition-colors hover:bg-pink-400/30 hover:border-pink-300/60">
                    Tekrar Dene
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Plays a short fanfare using Web Audio. Tone choice is variant-aware:
//   · confetti → triumphant major arpeggio (C5-E5-G5-C6)
//   · hearts   → gentle romantic progression (E5-G5-B5-D6)
// The audio context is created lazily so SSR and first paint aren't blocked.
function playFanfare(variant: "confetti" | "hearts") {
  try {
    type WithWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
    const w = window as WithWebkit;
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    // Master gain keeps the overall loudness gentle — ~ -16dB below peak so
    // the fanfare never startles a user who happens to have system volume up.
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);

    const notes = variant === "hearts"
      ? [659.25, 783.99, 987.77, 1174.66]  // E5 G5 B5 D6
      : [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = variant === "hearts" ? "sine" : "triangle";
      o.frequency.value = freq;
      const start = now + i * 0.11;
      const end   = start + 0.5;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.28, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      o.connect(g).connect(master);
      o.start(start);
      o.stop(end + 0.02);
    });
    // Final sustained chord — quieter so it serves as a gentle pad under
    // the last ribbons of particles rather than as a punch.
    const chord = variant === "hearts" ? [659.25, 987.77, 1318.51] : [523.25, 659.25, 783.99];
    const chordStart = now + notes.length * 0.11;
    chord.forEach((f) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, chordStart);
      g.gain.exponentialRampToValueAtTime(0.16, chordStart + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, chordStart + 0.9);
      o.connect(g).connect(master);
      o.start(chordStart);
      o.stop(chordStart + 0.95);
    });
    setTimeout(() => ctx.close().catch(() => { /* */ }), 1800);
  } catch {
    /* audio not allowed — silent fail */
  }
}

// Full-viewport particle burst played on score=3 finishes. "confetti" variant
// uses rectangular ribbons in theme-agnostic bright colors; "hearts" uses
// pink heart/sparkle glyphs for the Princess theme. Auto-dismisses after 2s.
function VictoryOverlay({ variant, onDone }: { variant: "confetti" | "hearts"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  const count = 64;
  const palette = variant === "hearts"
    ? ["#F472B6", "#EC4899", "#FBCFE8", "#F9A8D4", "#FDF2F8"]
    : ["#FBBF24", "#38BDF8", "#34D399", "#A78BFA", "#F472B6", "#FB7185"];

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Central "YOU WIN" burst */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.2, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="relative flex flex-col items-center gap-2 drop-shadow-2xl">
        <span className="text-7xl">{variant === "hearts" ? "💖" : "🏆"}</span>
        <span className="font-serif text-2xl font-bold tracking-wide"
          style={{ color: variant === "hearts" ? "#F9A8D4" : "#FBBF24" }}>
          {variant === "hearts" ? "Prenses Kurtarıldı!" : "Closed Tour!"}
        </span>
      </motion.div>
      {/* Particle burst */}
      {Array.from({ length: count }).map((_, i) => {
        const angle    = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const distance = 140 + Math.random() * 240;
        const dx       = Math.cos(angle) * distance;
        const dy       = Math.sin(angle) * distance + 40;
        const color    = palette[i % palette.length];
        return (
          <motion.span key={i}
            className="absolute select-none leading-none"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
            animate={{ x: dx, y: dy + 180, opacity: 0, scale: 1, rotate: 360 + Math.random() * 360 }}
            transition={{ duration: 1.7 + Math.random() * 0.6, ease: "easeOut", delay: Math.random() * 0.15 }}
            style={variant === "hearts"
              ? { fontSize: 14 + Math.random() * 18 }
              : { display: "inline-block", width: 8, height: 14, background: color, borderRadius: 2 }
            }>
            {variant === "hearts" ? (i % 3 === 0 ? "💗" : i % 3 === 1 ? "💖" : "✨") : ""}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
