import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-slate-400 mb-8">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={13} className="text-slate-600" />}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-slate-200 transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-300">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
