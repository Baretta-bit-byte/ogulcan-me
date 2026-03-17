import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import Backlinks from "@/components/Backlinks";
import { FolderGit2, ExternalLink } from "lucide-react";

const projects = [
  {
    href: "/projects/secureexam-generator",
    name: "SecureExam-Generator",
    description: "Tamper-proof exam generation with QR codes and watermark filigree.",
    tags: ["Python", "education", "security"],
    variant: "tech" as const,
  },
  {
    href: "/projects/notepadio",
    name: "NotePadIo",
    description: "Low-code collaborative note-taking architecture with real-time sync.",
    tags: ["lowcode", "collaboration"],
    variant: "tech" as const,
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]} />

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sky-400">
          <FolderGit2 size={20} strokeWidth={1.6} />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Projects
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-7">
          Tools I&apos;ve built at the intersection of education and technology.
        </p>
      </header>

      <ul className="space-y-4">
        {projects.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group block rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-sky-400/50 dark:hover:border-sky-400/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="font-mono text-sky-500 dark:text-sky-400 font-medium group-hover:underline">
                    {p.name}
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-6">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-xs text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded px-2 py-0.5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <ExternalLink
                  size={15}
                  className="shrink-0 mt-0.5 text-slate-400 group-hover:text-sky-400 transition-colors"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Backlinks nodeId="projects" />
    </div>
  );
}
