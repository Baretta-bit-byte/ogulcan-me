"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Star type ────────────────────────────────────────────────────────────── */

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  speed: number;
  phase: number;
  driftX: number;
  driftY: number;
}

interface ShootingStar {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const rafRef = useRef(0);
  const [isDark, setIsDark] = useState(true);

  // ── theme watcher ───────────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // ── star factory ────────────────────────────────────────────────────────
  const initStars = useCallback((w: number, h: number) => {
    starsRef.current = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2.2 + 0.4,
      baseOpacity: 0.25 + Math.random() * 0.75,
      opacity: Math.random(),
      speed: 0.004 + Math.random() * 0.014,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.07,
      driftY: (Math.random() - 0.5) * 0.035,
    }));
  }, []);

  // ── animation loop ──────────────────────────────────────────────────────
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
      if (starsRef.current.length === 0) initStars(cvs.width, cvs.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = cvs.width;
      const h = cvs.height;
      ctx.clearRect(0, 0, w, h);

      if (isDark) {
        /* ── night sky ── */
        for (const s of starsRef.current) {
          s.phase += s.speed;
          s.opacity = s.baseOpacity * (0.45 + 0.55 * Math.sin(s.phase));
          s.x += s.driftX;
          s.y += s.driftY;
          if (s.x < -5) s.x = w + 5;
          if (s.x > w + 5) s.x = -5;
          if (s.y < -5) s.y = h + 5;
          if (s.y > h + 5) s.y = -5;

          // glow halo for brighter stars
          if (s.size > 1.4) {
            const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
            g.addColorStop(0, `rgba(190,210,255,${s.opacity * 0.12})`);
            g.addColorStop(1, "rgba(190,210,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(s.x - s.size * 4, s.y - s.size * 4, s.size * 8, s.size * 8);
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(215,225,255,${s.opacity})`;
          ctx.fill();
        }

        // occasional shooting star
        if (Math.random() < 0.0015 && shootingRef.current.length < 2) {
          shootingRef.current.push({
            x: Math.random() * w * 0.6 + w * 0.1,
            y: Math.random() * h * 0.35,
            len: 50 + Math.random() * 70,
            speed: 5 + Math.random() * 7,
            angle: Math.PI / 5 + Math.random() * Math.PI / 5,
            opacity: 1,
            life: 0,
            maxLife: 25 + Math.random() * 25,
          });
        }
        shootingRef.current = shootingRef.current.filter((ss) => {
          ss.life++;
          ss.x += Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.opacity = 1 - ss.life / ss.maxLife;
          const tx = ss.x - Math.cos(ss.angle) * ss.len;
          const ty = ss.y - Math.sin(ss.angle) * ss.len;
          const g = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
          g.addColorStop(0, "rgba(255,255,255,0)");
          g.addColorStop(1, `rgba(255,255,255,${ss.opacity * 0.7})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(ss.x, ss.y);
          ctx.stroke();
          return ss.life < ss.maxLife;
        });
      } else {
        /* ── sunny day: golden motes ── */
        for (const s of starsRef.current) {
          s.phase += s.speed * 0.5;
          s.opacity = s.baseOpacity * (0.15 + 0.25 * Math.sin(s.phase));
          s.x += s.driftX * 0.25;
          s.y += s.driftY * 0.15 - 0.012;
          if (s.x < -5) s.x = w + 5;
          if (s.x > w + 5) s.x = -5;
          if (s.y < -10) s.y = h + 5;

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251,191,36,${s.opacity * 0.22})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isDark, initStars]);

  /* ── render ──────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
      {/* gradient sky */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, #0B1120 0%, #0d1527 40%, #0f1830 100%)"
            : "linear-gradient(to bottom, #eef4ff 0%, #faf8f4 50%, #f8fafc 100%)",
        }}
      />

      {/* star / mote canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* ── celestial body ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isDark ? (
          /* ── Moon ── */
          <motion.div
            key="moon"
            initial={{ scale: 0.7, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute top-10 right-[12%] w-[7rem] h-[7rem] rounded-full xl:w-[8.5rem] xl:h-[8.5rem]"
            style={{
              background: `
                radial-gradient(circle at 30% 28%, rgba(220,225,240,0.4) 0%, transparent 55%),
                radial-gradient(circle at 62% 58%, rgba(150,155,180,0.2) 0%, transparent 40%),
                radial-gradient(circle at 36% 42%, #b5b5c5 0%, #7e7e92 28%, #52526a 58%, #3a3a50 100%)
              `,
              boxShadow: `
                0 0 30px rgba(180,195,240,0.20),
                0 0 70px rgba(180,195,240,0.10),
                0 0 140px rgba(180,195,240,0.05)
              `,
            }}
          >
            {/* craters */}
            <div className="absolute w-[18%] h-[18%] rounded-full top-[12%] left-[22%]"
              style={{ background: "radial-gradient(circle, rgba(60,60,80,0.35) 0%, transparent 70%)" }} />
            <div className="absolute w-[12%] h-[12%] rounded-full top-[50%] left-[55%]"
              style={{ background: "radial-gradient(circle, rgba(60,60,80,0.25) 0%, transparent 70%)" }} />
            <div className="absolute w-[22%] h-[22%] rounded-full bottom-[14%] right-[16%]"
              style={{ background: "radial-gradient(circle, rgba(60,60,80,0.22) 0%, transparent 70%)" }} />
            <div className="absolute w-[10%] h-[10%] rounded-full bottom-[35%] left-[30%]"
              style={{ background: "radial-gradient(circle, rgba(60,60,80,0.30) 0%, transparent 70%)" }} />
          </motion.div>
        ) : (
          /* ── Sun ── */
          <motion.div
            key="sun"
            initial={{ scale: 0.7, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute top-8 right-[12%] w-[4.2rem] h-[4.2rem] rounded-full xl:w-[5.2rem] xl:h-[5.2rem]"
            style={{
              background: "radial-gradient(circle at 38% 38%, #fffde8 0%, #fcd34d 22%, #f59e0b 52%, #d97706 100%)",
              boxShadow: `
                0 0 30px rgba(251,191,36,0.35),
                0 0 60px rgba(251,191,36,0.15),
                0 0 120px rgba(251,191,36,0.06)
              `,
            }}
          >
            {/* rotating rays */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-50%] rounded-full"
              style={{
                background: `conic-gradient(from 0deg,
                  transparent 0deg,   rgba(251,191,36,0.07) 4deg,  transparent 8deg,
                  transparent 30deg,  rgba(251,191,36,0.05) 34deg, transparent 38deg,
                  transparent 60deg,  rgba(251,191,36,0.07) 64deg, transparent 68deg,
                  transparent 90deg,  rgba(251,191,36,0.04) 94deg, transparent 98deg,
                  transparent 120deg, rgba(251,191,36,0.06) 124deg,transparent 128deg,
                  transparent 150deg, rgba(251,191,36,0.05) 154deg,transparent 158deg,
                  transparent 180deg, rgba(251,191,36,0.07) 184deg,transparent 188deg,
                  transparent 210deg, rgba(251,191,36,0.04) 214deg,transparent 218deg,
                  transparent 240deg, rgba(251,191,36,0.06) 244deg,transparent 248deg,
                  transparent 270deg, rgba(251,191,36,0.05) 274deg,transparent 278deg,
                  transparent 300deg, rgba(251,191,36,0.07) 304deg,transparent 308deg,
                  transparent 330deg, rgba(251,191,36,0.04) 334deg,transparent 338deg,
                  transparent 360deg)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
