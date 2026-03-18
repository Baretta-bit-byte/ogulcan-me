import Link from "next/link";
import { ArrowRight, MapPin, Calendar, ExternalLink, Download, GraduationCap, Heart, Users, Brain, Trophy } from "lucide-react";
import LinkedTerm from "@/components/LinkedTerm";
import Backlinks from "@/components/Backlinks";

const timeline = [
  {
    year: "2023 — present",
    title: "Computer Science",
    place: "University",
    description: "Algorithms, systems, applied mathematics. Primary languages: Python, C++.",
    type: "education",
    icon: GraduationCap,
    href: undefined as string | undefined,
  },
  {
    year: "Mar 2026 — present",
    title: "AFAD & LÖSEV Volunteer",
    place: "Turkey",
    description: "Disaster & emergency management (AFAD) and children's leukemia foundation (LÖSEV).",
    type: "community",
    icon: Heart,
    href: "/community/volunteering",
  },
  {
    year: "2025 — present",
    title: "Turkish Informatics Association",
    place: "Turkey",
    description: "Active member of TBA — national non-profit promoting CS education and digital literacy since 1971.",
    type: "community",
    icon: Users,
    href: "/community/tba",
  },
  {
    year: "2025",
    title: "Game Theory — Ali Nesin Mathematics Village",
    place: "Şirince, İzmir",
    description: "Intensive training covering Nash equilibria, minimax theorem, Shapley value, and mechanism design.",
    type: "math",
    icon: Brain,
    href: "/math/game-theory",
  },
  {
    year: "2024",
    title: "Izmir Mathematics Festival",
    place: "İzmir",
    description: "Olympiad rounds, puzzle workshops, and research lectures for undergraduates.",
    type: "math",
    icon: Trophy,
    href: "/math/izmir-festival",
  },
];

const typeColor: Record<string, string> = {
  education: "bg-sky-400",
  community: "bg-emerald-400",
  math: "bg-violet-400",
};

const typeIconBg: Record<string, string> = {
  education: "bg-sky-400/15",
  community: "bg-emerald-400/15",
  math: "bg-violet-400/15",
};

const typeIconText: Record<string, string> = {
  education: "text-sky-400",
  community: "text-emerald-400",
  math: "text-violet-400",
};

const projects = [
  {
    href: "/projects/secureexam-generator",
    name: "SecureExam-Generator",
    description: "Tamper-proof exam generation for educators. Cryptographic watermarking meets educational tooling.",
    tags: ["Python", "Security", "Education"],
  },
  {
    href: "/projects/notepadio",
    name: "NotePadIo",
    description: "Real-time collaborative notes. Low-code architecture, WebSocket sync, zero-friction sharing.",
    tags: ["Low-code", "Realtime", "Web"],
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto pb-24 font-sans">

      {/* Hero */}
      <section className="mt-6 mb-12">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
              Oğulcan Tokmak
            </h1>
            <p className="font-mono text-sm text-slate-400">software · mathematics · community</p>
          </div>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-mono text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            Open to internships
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1"><MapPin size={11} /> Turkey</span>
          <span className="flex items-center gap-1"><Calendar size={11} /> Available Summer 2026</span>
          <a
            href="/cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
          >
            <Download size={11} /> CV
          </a>
        </div>
      </section>

      {/* Narrative */}
      <section className="mb-12 space-y-4">
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          I&apos;m a computer science student drawn to problems where a clean formal model produces a
          surprisingly practical result — where the boundary between theory and engineering dissolves.
          My work primarily lives at the intersection of <span className="text-sky-400 font-medium">education</span>,{" "}
          <span className="text-sky-400 font-medium">security</span>, and{" "}
          <span className="text-violet-400 font-medium">mathematical rigour</span>.
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          I write Python for data pipelines and rapid prototyping, C++ when performance
          and memory control matter. I build tools I actually want to use — not demos, but software
          with genuine edge cases that need to be handled.
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          Beyond code, I&apos;m an active member of the{" "}
          <LinkedTerm
            href="/community/tba"
            variant="tech"
            title="Turkish Informatics Association"
            content="A national non-profit promoting CS education and digital literacy in Turkey since 1971."
          >
            Turkish Informatics Association
          </LinkedTerm>{" "}
          and volunteer at{" "}
          <LinkedTerm
            href="/community/volunteering"
            variant="default"
            title="AFAD & LÖSEV"
            content="AFAD (Disaster & Emergency Management) and LÖSEV (Children with Leukemia Foundation) — volunteering since March 2026."
          >
            AFAD &amp; LÖSEV
          </LinkedTerm>
          . I believe the most interesting engineering happens in contexts with real human stakes.
        </p>
      </section>

      {/* Projects */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects</h2>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors"
          >
            All projects <ArrowRight size={11} />
          </Link>
        </div>
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p.href} href={p.href}>
              <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-sky-400/40 transition-colors bg-white dark:bg-slate-900/50">
                <div className="absolute inset-y-0 left-0 w-0.5 bg-sky-400/40 group-hover:bg-sky-400 transition-colors" />
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-semibold text-sky-500 dark:text-sky-400">
                    {p.name}
                  </span>
                  <ExternalLink size={12} className="text-slate-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-6">
                  {p.description}
                </p>
                <div className="mt-3 flex gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-5">Timeline</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-6">
            {timeline.map((item, i) => {
              const Icon = item.icon;
              const content = (
                <div key={i} className={`flex gap-5 ${item.href ? "group cursor-pointer" : ""}`}>
                  {/* Icon dot */}
                  <div className="relative mt-1 shrink-0">
                    <div className={`h-8 w-8 rounded-full ${typeIconBg[item.type]} ring-2 ring-white dark:ring-slate-900 flex items-center justify-center`}>
                      <Icon size={14} className={typeIconText[item.type]} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs text-slate-400">{item.year}</span>
                    </div>
                    <p className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${item.href ? "group-hover:text-sky-400 transition-colors" : ""}`}>{item.title}</p>
                    <p className="text-xs text-slate-400 font-mono mb-1">{item.place}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-6">{item.description}</p>
                  </div>
                </div>
              );
              return item.href ? (
                <Link key={i} href={item.href}>{content}</Link>
              ) : (
                content
              );
            })}
          </div>
        </div>
      </section>

      {/* Mathematics */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Mathematics</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          Mathematics is not separate from my engineering work — it shapes how I think about
          problem structure. I attended the{" "}
          <LinkedTerm
            href="/math/izmir-festival"
            variant="math"
            title="Izmir Mathematics Festival"
            content="A regional celebration of mathematical thinking for K–12 students and undergraduates — olympiad rounds, puzzle workshops, and research lectures."
          >
            Izmir Mathematics Festival
          </LinkedTerm>{" "}
          and completed{" "}
          <LinkedTerm
            href="/math/game-theory"
            variant="math"
            title="Game Theory — Ali Nesin"
            content="Intensive training at Ali Nesin Mathematics Village covering Nash equilibria, minimax theorem, Shapley value, and mechanism design."
          >
            Game Theory training at Ali Nesin Mathematics Village
          </LinkedTerm>
          , where formal proofs and real-world strategic models coexisted in the same classroom.
        </p>
      </section>

      {/* Currently */}
      <section className="mb-12 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest">
            Currently
          </h2>
          <Link
            href="/now"
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-sky-400 transition-colors"
          >
            /now <ArrowRight size={11} />
          </Link>
        </div>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-sky-400 shrink-0" />
            Studying CS — algorithms, systems, applied mathematics
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
            Volunteering at AFAD &amp; LÖSEV
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-violet-400 shrink-0" />
            Building this digital garden
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-amber-400 shrink-0" />
            Looking for 2026 summer software engineering internship
          </li>
        </ul>
      </section>

      {/* Colophon */}
      <section className="mb-12 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900/50">
        <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Colophon
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-6 mb-3">
          This site is a digital garden — an interconnected, ever-evolving knowledge graph rather
          than a static portfolio. It&apos;s designed to grow with every idea.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Next.js 16",
            "Tailwind CSS v4",
            "Framer Motion",
            "react-force-graph-2d",
            "next-mdx-remote",
            "Radix UI",
            "Lucide Icons",
            "GitHub Pages",
            "Umami Analytics",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-500 dark:text-slate-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <Backlinks nodeId="about" />
    </div>
  );
}
