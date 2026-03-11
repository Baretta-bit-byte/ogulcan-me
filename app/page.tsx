import Link from "next/link";
import LinkedTerm from "@/components/LinkedTerm";
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
          I&apos;m a developer and mathematician who builds tools at the intersection
          of education and technology. I&apos;m an active member of the{" "}
          <LinkedTerm
            href="/community/tba"
            variant="tech"
            content="Turkish Informatics Association — a national body promoting computer science education and digital literacy."
          >
            Turkish Informatics Association
          </LinkedTerm>{" "}
          and a volunteer at{" "}
          <LinkedTerm
            href="/community/volunteering"
            variant="default"
            content="AFAD (Disaster & Emergency Management) and LÖSEV (Children with Leukemia Foundation) — volunteering since March 2026."
          >
            AFAD &amp; LÖSEV
          </LinkedTerm>
          .
        </p>
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
            className="group block rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-sky-400/40 transition-colors"
          >
            <LinkedTerm
              href="/projects/secureexam-generator"
              variant="tech"
              content="A tool for generating tamper-proof, cryptographically secure exam papers for educators."
            >
              SecureExam-Generator
            </LinkedTerm>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tamper-proof exam generation for educators.
            </p>
          </Link>

          <Link
            href="/projects/notepadio"
            className="group block rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-sky-400/40 transition-colors"
          >
            <LinkedTerm
              href="/projects/notepadio"
              variant="tech"
              content="A real-time collaborative note-taking platform with low-code architecture and live sync."
            >
              NotePadIo
            </LinkedTerm>
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
            content="The Izmir Mathematics Festival — a regional celebration of mathematical thinking for students and undergraduates."
          >
            Izmir Mathematics Festival
          </LinkedTerm>{" "}
          and completed{" "}
          <LinkedTerm
            href="/math/game-theory"
            variant="math"
            content="Game Theory training at Ali Nesin Mathematics Village — an international math research center in Şirince, Turkey."
          >
            Game Theory training at Ali Nesin Mathematics Village
          </LinkedTerm>{" "}
          with the Mathematics and Technology Club.
        </p>
      </section>
    </article>
  );
}
