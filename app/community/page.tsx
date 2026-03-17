import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import Backlinks from "@/components/Backlinks";
import { Users, ExternalLink } from "lucide-react";

const activities = [
  {
    href: "/community/tba",
    name: "Turkish Informatics Association",
    description: "Active member of TBA — a national body promoting CS education and digital literacy.",
    tags: ["tech", "education"],
    since: "2024–present",
  },
  {
    href: "/community/volunteering",
    name: "AFAD & LÖSEV Volunteering",
    description: "Volunteer at AFAD (disaster management) and LÖSEV (children with leukemia) since March 2026.",
    tags: ["social", "volunteering"],
    since: "March 2026",
  },
];

export default function CommunityPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Community" }]} />

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={20} strokeWidth={1.6} />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Community
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-7">
          Organizations and volunteering I&apos;m actively involved with.
        </p>
      </header>

      <ul className="space-y-4">
        {activities.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              className="group block rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-400/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-700 dark:text-slate-200 font-medium group-hover:underline">
                      {a.name}
                    </span>
                    <span className="text-xs text-slate-400">{a.since}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-6">
                    {a.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {a.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-xs text-slate-400 bg-slate-400/10 border border-slate-400/20 rounded px-2 py-0.5"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <ExternalLink size={15} className="shrink-0 mt-0.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Backlinks nodeId="community" />
    </div>
  );
}
