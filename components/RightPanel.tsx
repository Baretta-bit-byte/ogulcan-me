"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import GraphNav from "./GraphNav";
import GraphModal from "./GraphModal";
import TableOfContents from "./TableOfContents";
import { useRightPanel } from "@/lib/rightPanelContext";

export default function RightPanel() {
  const { tocItems } = useRightPanel();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <aside className="hidden xl:flex h-screen w-[340px] shrink-0 flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Graph View header with expand button */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className="font-mono text-xs text-slate-400">Graph View</span>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title="Expand full graph"
          >
            <Share2 size={13} />
          </button>
        </div>

        {/* Local graph */}
        <div className="h-[260px] shrink-0">
          <GraphNav />
        </div>

        {/* Table of Contents */}
        {tocItems.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <TableOfContents items={tocItems} />
          </div>
        )}
      </aside>

      {/* Full-screen graph modal */}
      <GraphModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
