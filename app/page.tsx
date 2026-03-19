import Link from "next/link";
import LinkedTerm from "@/components/LinkedTerm";
import HoverTooltip from "@/components/HoverTooltip";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <article className="space-y-12">
      {/* Bio */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Ogulcan
        </h1>
        <p className="font-mono text-sm text-slate-400">
          software · mathematics · community
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          Computer science student building tools where education, security, and
          mathematical rigour intersect. I work primarily in Python and C++, and
          I&apos;m drawn to problems where a clean formal model produces a
          surprisingly practical result.
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          I&apos;m an active member of the{" "}
          <LinkedTerm
            href="/community/tba"
            variant="tech"
            title="Turkish Informatics Association"
            content="A national non-profit promoting CS education and digital literacy in Turkey since 1971."
          >
            Turkish Informatics Association
          </LinkedTerm>{" "}
          and a volunteer at{" "}
          <LinkedTerm
            href="/community/volunteering"
            variant="default"
            title="AFAD & LÖSEV"
            content="AFAD (Disaster & Emergency Management) and LÖSEV (Children with Leukemia Foundation) — volunteering since March 2026."
          >
            AFAD &amp; LÖSEV
          </LinkedTerm>
          . Looking for a 2026 summer software engineering internship.
        </p>
      </section>

      {/* Academics */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Academics
        </h2>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          Current coursework spans algorithms, systems, and applied mathematics:
        </p>
        <ul className="space-y-2">
          {[
            { name: "Data Structures and Algorithms", lang: "C++", tip: "Dynamic programming, graph algorithms, amortised analysis, and complexity theory." },
            { name: "Advanced C Programming", lang: "C", tip: "Memory management, pointer arithmetic, system calls, and embedded constraints." },
            { name: "Low-Code Web & Mobile App Design", lang: "No-code/Low-code", tip: "Component-driven UI architecture, API integration, and deployment pipelines without custom runtimes." },
            { name: "Probability & Statistics for CS", lang: "Python", tip: "Bayesian reasoning, hypothesis testing, distributions, and simulation-based inference." },
            { name: "Data Mining", lang: "Python", tip: "Decision trees, Apriori association rules, clustering, and feature engineering on structured datasets." },
            { name: "Numerical Analysis", lang: "Python", tip: "Lagrange interpolation, Newton's method, numerical integration, and floating-point error analysis." },
          ].map(({ name, lang, tip }) => (
            <li key={name} className="flex items-start gap-3 text-sm">
              <span className="mt-1 h-1 w-1 rounded-full bg-slate-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">
                <HoverTooltip variant="default" label={name} content={tip}>
                  {name}
                </HoverTooltip>
                <span className="ml-2 font-mono text-xs text-slate-400">
                  {lang}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Projects</h2>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-sky-400 transition-colors"
          >
            All projects <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-3">
          <Link
            href="/projects/secureexam-generator"
            className="group block rounded-xl border border-slate-200/50 dark:border-slate-700/40 bg-white/30 dark:bg-slate-800/25 backdrop-blur-sm p-4 hover:border-sky-400/40 transition-colors"
          >
            <span className="font-mono text-sm text-sky-500 dark:text-sky-400 group-hover:underline">
              SecureExam-Generator
            </span>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tamper-proof exam generation for educators.
            </p>
          </Link>

          <Link
            href="/projects/notepadio"
            className="group block rounded-xl border border-slate-200/50 dark:border-slate-700/40 bg-white/30 dark:bg-slate-800/25 backdrop-blur-sm p-4 hover:border-sky-400/40 transition-colors"
          >
            <span className="font-mono text-sm text-sky-500 dark:text-sky-400 group-hover:underline">
              NotePadIo
            </span>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real-time collaborative notes.
            </p>
          </Link>
        </div>
      </section>

      {/* Mathematics */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mathematics</h2>
          <Link
            href="/math"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-violet-400 transition-colors"
          >
            All topics <ArrowRight size={13} />
          </Link>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          I attended the{" "}
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
          </LinkedTerm>{" "}
          with the Mathematics and Technology Club.
        </p>
      </section>
    </article>
  );
}
