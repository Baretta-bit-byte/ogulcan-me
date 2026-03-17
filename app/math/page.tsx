import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import Backlinks from "@/components/Backlinks";
import { Calculator, ExternalLink } from "lucide-react";

const topics = [
  {
    href: "/math/game-theory",
    name: "Game Theory",
    description: "Training at Ali Nesin Mathematics Village with the Mathematics and Technology Club.",
    tags: ["gametheory", "nesin"],
    date: "Summer 2025",
  },
  {
    href: "/math/izmir-festival",
    name: "Izmir Mathematics Festival",
    description: "Volunteer at the regional festival celebrating mathematical thinking for students.",
    tags: ["festival", "community"],
    date: "2025",
  },
];

const courses = [
  "Data Structures and Algorithms (C++)",
  "Advanced C Programming",
  "Probability & Statistics for CS (Python)",
  "Data Mining — Decision Trees, Apriori",
  "Numerical Analysis — Lagrange Interpolation",
];

export default function MathPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Mathematics" }]} />

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-violet-400">
          <Calculator size={20} strokeWidth={1.6} />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Mathematics
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-7">
          Mathematical exploration, competitions, and coursework.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Events & Training</h2>
        <ul className="space-y-4">
          {topics.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="group block rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-violet-400/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-violet-500 dark:text-violet-400 font-medium group-hover:underline">
                        {t.name}
                      </span>
                      <span className="text-xs text-slate-400">{t.date}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-6">
                      {t.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-xs text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded px-2 py-0.5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ExternalLink size={15} className="shrink-0 mt-0.5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Coursework</h2>
        <ul className="space-y-2">
          {courses.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="h-1 w-1 rounded-full bg-violet-400 shrink-0" />
              <code className="font-mono">{c}</code>
            </li>
          ))}
        </ul>
      </section>

      <Backlinks nodeId="math" />
    </div>
  );
}
