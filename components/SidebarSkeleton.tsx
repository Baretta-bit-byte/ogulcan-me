export default function SidebarSkeleton() {
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      {/* Signature placeholder */}
      <div className="px-4 pt-6 pb-2">
        <div className="h-10 w-32 animate-pulse rounded bg-slate-800" />
      </div>

      {/* Nav item skeletons */}
      <div className="mt-4 space-y-1 px-2">
        {[100, 72, 88, 80].map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-md px-3 py-2"
          >
            <div className="h-3.5 w-3.5 animate-pulse rounded bg-slate-800" />
            <div
              className="h-3 animate-pulse rounded bg-slate-800"
              style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
            />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-800 px-4 py-3">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
        <div className="h-6 w-6 animate-pulse rounded bg-slate-800" />
      </div>
    </aside>
  );
}
