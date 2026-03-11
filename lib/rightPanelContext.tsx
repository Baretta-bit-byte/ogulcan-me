"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface TocItem {
  id: string;
  label: string;
  level: 1 | 2 | 3;
}

interface RightPanelCtx {
  tocItems: TocItem[];
  setTocItems: (items: TocItem[]) => void;
}

const RightPanelContext = createContext<RightPanelCtx>({
  tocItems: [],
  setTocItems: () => {},
});

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [tocItems, setTocItemsState] = useState<TocItem[]>([]);
  const setTocItems = useCallback((items: TocItem[]) => setTocItemsState(items), []);
  return (
    <RightPanelContext.Provider value={{ tocItems, setTocItems }}>
      {children}
    </RightPanelContext.Provider>
  );
}

export function useRightPanel() {
  return useContext(RightPanelContext);
}
